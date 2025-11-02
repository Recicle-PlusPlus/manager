import React from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDocs, serverTimestamp, collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Firestore, Storage } from '../../../config/firebase';

export type FormValues = {
  intId?: number; // ID numérico do produto (gerado automaticamente ou informado para edição)
  name: string;
  description: string;
  currentPrice: string;
  originalPrice: string;
  stock: number;
  category: string;
  file: File | null;
  imgUrl?: string; // URL da imagem atual (usado na edição)
};

export enum ProductCategory {
  Sports = 'Esportes',
  Clothing = 'Roupas',
  Entertainment = 'Entretenimento',
  Electronics = 'Eletrônicos',
  Home = 'Casa',
  Sustainable = 'Sustentável',
}

const firestoreRefMarketplace = collection(Firestore, 'marketplace');

// Função para buscar o próximo intId disponível
async function getNextIntId(): Promise<number> {
  const snapshot = await getDocs(firestoreRefMarketplace);
  let maxId = 0;
  snapshot.forEach((doc) => {
    const data = doc.data();
    const currentId = data.intId || parseInt(doc.id) || 0;
    if (currentId > maxId) {
      maxId = currentId;
    }
  });
  return maxId + 1;
}

export default function ProductInsertForm({ onSuccess, initialValues }: { onSuccess?: () => void, initialValues?: Partial<FormValues> }) {
  const isEditing = Boolean(initialValues?.intId);

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      intId: undefined,
      name: '',
      description: '',
      currentPrice: '',
      originalPrice: '',
      stock: 0,
      category: '',
      file: null,
      ...initialValues,
    },
  });
  const [loading, setloading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const watchedFile = watch('file') as File | null;

  React.useEffect(() => {
    if (initialValues) {
      (Object.entries(initialValues) as [keyof FormValues, any][]).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [initialValues, setValue]);

  // Função para upload de imagem
  async function uploadProductImage(file: File | null): Promise<string | null> {
    if (!file) return null;
    const path = `images/marketplace/${Date.now()}_${file.name}`;
    const sRef = storageRef(Storage, path);
    await uploadBytes(sRef, file);
    return await getDownloadURL(sRef);
  }

  // Função para atualizar produto
  async function updateProduct(data: FormValues, imageUrl: string | null) {
    const intId = initialValues?.intId || data.intId;
    if (!intId) throw new Error('ID do produto não encontrado para edição.');

    const productDocRef = doc(Firestore, 'marketplace', String(intId));

    const updateData: any = {
      intId: intId,
      name: data.name,
      description: data.description,
      currentPrice: Number(data.currentPrice),
      originalPrice: Number(data.originalPrice),
      stock: Number(data.stock),
      category: data.category,
      updatedAt: serverTimestamp(),
    };

    // Se enviou nova imagem, atualiza. Senão, mantém a anterior
    if (imageUrl) {
      updateData.imgUrl = imageUrl;
    } else if (initialValues?.imgUrl) {
      updateData.imgUrl = initialValues.imgUrl;
    }

    // Usa updateDoc ao invés de setDoc para atualizar documento existente
    await updateDoc(productDocRef, updateData);
  }

  // Função para adicionar produto
  async function addProduct(data: FormValues, imageUrl: string | null, intId: number) {
    const product = {
      intId: intId,
      name: data.name,
      description: data.description,
      currentPrice: Number(data.currentPrice),
      originalPrice: Number(data.originalPrice),
      stock: Number(data.stock),
      category: data.category,
      imgUrl: imageUrl || '',
      createdAt: serverTimestamp(),
    };
    // Usa o intId como ID do documento
    const productDocRef = doc(Firestore, 'marketplace', String(intId));
    await setDoc(productDocRef, product);
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setloading(true);
    setMessage(null);
    try {
      const imageUrl = await uploadProductImage(data.file);

      if (isEditing) {
        // Modo de edição
        try {
          await updateProduct(data, imageUrl);
          setMessage('Produto atualizado com sucesso.');
          if (onSuccess) onSuccess();
        } catch (err: any) {
          setMessage(err?.message || 'Erro ao atualizar produto');
        }
        setloading(false);
        console.log('Produto atualizado');
        return;
      }

      // Modo de criação - gerar novo intId
      const nextIntId = await getNextIntId();
      await addProduct(data, imageUrl, nextIntId);
      setMessage(`Produto salvo com sucesso. ID: ${nextIntId}`);
      if (onSuccess) onSuccess();
      try { reset(); } catch (e) { }
    } catch (err: any) {
      console.error('Erro ao salvar produto:', err);
      setMessage(err?.message || 'Erro ao salvar produto');
    } finally {
      setloading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1>{isEditing ? 'Editar Produto' : 'Adicionar Produto'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
        {isEditing && (
          <div style={{ marginBottom: 12, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
            <strong>ID do Produto: {initialValues.intId}</strong>
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Título</label>
          <input
            {...register('name', { required: 'Título é obrigatório' })}
            placeholder="Nome do produto"
            style={{ width: '100%', padding: 8 }}
          />
          {errors.name && (
            <span style={{ color: 'red', fontSize: 12 }}>{errors.name.message}</span>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Descrição</label>
          <textarea
            {...register('description', { required: 'Descrição é obrigatória' })}
            placeholder="Descrição do produto"
            rows={4}
            style={{ width: '100%', padding: 8 }}
          />
          {errors.description && (
            <span style={{ color: 'red', fontSize: 12 }}>{errors.description.message}</span>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Preço Original</label>
          <input
            {...register('originalPrice', {
              required: 'Preço original é obrigatório',
              validate: v => (v !== '' && !isNaN(Number(v)) && Number(v) > 0) || 'Preço inválido',
            })}
            placeholder="0.00"
            inputMode="decimal"
            style={{ width: '100%', padding: 8 }}
          />
          {errors.originalPrice && (
            <span style={{ color: 'red', fontSize: 12 }}>{errors.originalPrice.message}</span>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Preço Atual (com desconto)</label>
          <input
            {...register('currentPrice', {
              required: 'Preço é obrigatório',
              validate: {
                validNumber: v => (v && !isNaN(Number(v)) && Number(v) > 0) || 'Preço inválido',
                notGreaterThanOriginal: v => {
                  const originalPrice = watch('originalPrice');
                  if (!originalPrice || !v) return true;
                  return Number(v) <= Number(originalPrice) || 'Preço atual não pode ser maior que o preço original';
                }
              }
            })}
            placeholder="0.00"
            inputMode="decimal"
            style={{ width: '100%', padding: 8 }}
          />
          {errors.currentPrice && (
            <span style={{ color: 'red', fontSize: 12 }}>{errors.currentPrice.message}</span>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Categoria</label>
          <select
            {...register('category', { required: 'Categoria é obrigatória' })}
            style={{ width: '100%', padding: 8 }}
            defaultValue=""
          >
            <option value="" disabled>Selecione uma categoria</option>
            {Object.entries(ProductCategory).map(([key, value]) => (
              <option key={key} value={value}>{value}</option>
            ))}
          </select>
          {errors.category && (
            <span style={{ color: 'red', fontSize: 12 }}>{errors.category.message}</span>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Estoque (stock)</label>
          <input
            {...register('stock', { required: 'Estoque é obrigatório', valueAsNumber: true, min: { value: 0, message: 'Estoque não pode ser negativo' } })}
            type="number"
            style={{ width: '100%', padding: 8 }}
          />
          {errors.stock && (
            <span style={{ color: 'red', fontSize: 12 }}>{errors.stock.message as string}</span>
          )}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Imagem</label>
          {isEditing && initialValues?.imgUrl && !watchedFile && (
            <div style={{ marginBottom: 8, padding: 8, backgroundColor: '#f9f9f9', borderRadius: 4 }}>
              <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#666' }}>Imagem atual:</p>
              <img
                src={initialValues.imgUrl}
                alt="Imagem atual do produto"
                style={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain', border: '1px solid #ddd', borderRadius: 4 }}
              />
              <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#666' }}>
                Envie uma nova imagem apenas se desejar alterá-la.
              </p>
            </div>
          )}
          <Controller
            control={control}
            name="file"
            rules={{ required: !isEditing ? 'Imagem é obrigatória' : false }}
            render={({ field }) => (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
              />
            )}
          />
          {errors.file && (
            <div style={{ color: 'red', fontSize: 12 }}>{(errors.file as any).message}</div>
          )}
          {watchedFile && (
            <div style={{ marginTop: 8 }}>
              Arquivo: {watchedFile.name} ({Math.round(watchedFile.size / 1024)} KB)
            </div>
          )}
        </div>
        {loading ? (
          <div style={{ margin: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <CircularProgress size={20} />
            <span>Enviando...</span>
          </div>
        ) : (
          <div style={{ margin: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <button type="submit" style={{ padding: '8px 16px' }}>
              {isEditing ? 'Atualizar Produto' : 'Enviar Produto'}
            </button>
          </div>
        )}
      </form>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
