import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';
import { serverTimestamp, collection, doc, updateDoc, getDocs } from 'firebase/firestore';
import { Firestore } from '../../../config/firebase';

export type MaterialFormValues = {
  id: string;
  name: string;
  collectorPoints: number;
  donorPoints: number;
};

const firestoreRefMaterials = collection(Firestore, 'materials');

export default function MaterialForm({
  onSuccess,
  initialValues
}: {
  onSuccess?: () => void;
  initialValues?: Partial<MaterialFormValues>;
}) {
  const isEditing = Boolean(initialValues?.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaterialFormValues>({
    defaultValues: {
      id: '',
      name: '',
      collectorPoints: 0,
      donorPoints: 0,
      ...initialValues,
    },
  });

  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function updateMaterial(data: MaterialFormValues) {
    if (!data.id) throw new Error('ID do material não encontrado para edição.');

    const materialDocRef = doc(Firestore, 'materials', data.id);

    const updateData: any = {
      name: data.name,
      points: {
        coletor: Number(data.collectorPoints),
        donor: Number(data.donorPoints),
      },
      updatedAt: serverTimestamp(),
    };

    await updateDoc(materialDocRef, updateData);
  }

  const onSubmit: SubmitHandler<MaterialFormValues> = async (data) => {
    setLoading(true);
    setMessage(null);
    try {
      if (isEditing) {
        await updateMaterial(data);
        setMessage('Material atualizado com sucesso.');
        if (onSuccess) onSuccess();
      } else {
        setMessage('Modo de criação não implementado. Use apenas para edição.');
      }
    } catch (err: any) {
      console.error('Erro ao salvar material:', err);
      setMessage(err?.message || 'Erro ao salvar material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1>{isEditing ? 'Editar Material' : 'Material'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column' }}>
        {isEditing && (
          <div style={{ marginBottom: 12, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
            <strong>ID do Material: {initialValues?.id}</strong>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Nome do Material</label>
          <input
            {...register('name', { required: 'Nome é obrigatório' })}
            placeholder="Ex: Plástico, Papel, Vidro..."
            style={{ width: '100%', padding: 8 }}
            disabled={!isEditing}
          />
          {errors.name && (
            <span style={{ color: 'red', fontSize: 12 }}>{errors.name.message}</span>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>
            Pontos para Coletor (por kg)
          </label>
          <input
            {...register('collectorPoints', {
              required: 'Pontos do coletor são obrigatórios',
              valueAsNumber: true,
              min: { value: 0, message: 'Pontos não podem ser negativos' },
            })}
            type="number"
            placeholder="20"
            style={{ width: '100%', padding: 8 }}
          />
          {errors.collectorPoints && (
            <span style={{ color: 'red', fontSize: 12 }}>{errors.collectorPoints.message}</span>
          )}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>
            Pontos para Doador (por kg)
          </label>
          <input
            {...register('donorPoints', {
              required: 'Pontos do doador são obrigatórios',
              valueAsNumber: true,
              min: { value: 0, message: 'Pontos não podem ser negativos' },
            })}
            type="number"
            placeholder="10"
            style={{ width: '100%', padding: 8 }}
          />
          {errors.donorPoints && (
            <span style={{ color: 'red', fontSize: 12 }}>{errors.donorPoints.message}</span>
          )}
        </div>

        {loading ? (
          <div style={{ margin: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <CircularProgress size={20} />
            <span>Salvando...</span>
          </div>
        ) : (
          <div style={{ margin: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <button type="submit" style={{ padding: '8px 16px' }} disabled={!isEditing}>
              {isEditing ? 'Salvar Alterações' : 'Selecione um material para editar'}
            </button>
          </div>
        )}
      </form>
      {message && (
        <p style={{
          marginTop: 12,
          padding: 12,
          backgroundColor: message.includes('sucesso') ? '#d4edda' : '#f8d7da',
          color: message.includes('sucesso') ? '#155724' : '#721c24',
          borderRadius: 4
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
