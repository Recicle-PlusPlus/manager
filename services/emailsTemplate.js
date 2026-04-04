function getAccessDennyHtml(userName = "Usuário", companyName = "Recicle++") {
  const acessDenny = `
        <div style="font-family: Arial, sans-serif; margin: 20px; padding: 20px; border: 1px solid #ccc; max-width: 600px; text-align: center;">
            <h1 style="color: #d9534f;">Pedido de Cadastro Negado</h1>
            <h4>Prezado ${userName},</h4>
            <p>
                Lamentamos informar que seu pedido de cadastro no sistema ${companyName} foi negado pelo administrador do sistema.
                Se você tiver alguma dúvida ou precisar de mais informações sobre essa decisão, por favor, entre em contato conosco por email:
                <a href="mailto:ic.recicle.usp@gmail.com">ic.recicle.usp@gmail.com</a>
            </p>
            <p>Agradecemos o seu interesse em nossa plataforma e lamentamos por qualquer inconveniência causada.</p>
            <p>Atenciosamente,<br>Equipe ${companyName}</p>
        </div>
    `;
  return acessDenny;
}

function getAccessAcceptHtml(
  linkLogin,
  userName = "Usuário",
  email = "teste@test",
  companyName = "Recicle++",
) {
  const acessAccept = `
        <div style="font-family: Arial, sans-serif; margin: 20px; padding: 20px; border: 1px solid #4CAF50; max-width: 600px; text-align: center;">
            <h1 style="color: #4CAF50;">Pedido de Cadastro Aceito</h1>
            <h5>Prezado(a) ${userName},</h5>
            <p>
                É com prazer que informamos que seu pedido de cadastro no sistema ${companyName} foi aceito com sucesso!
                Para sua conveniência, uma senha temporária foi gerada para você. Use a seguinte senha para fazer login em sua conta:
            </p>
            <p><strong>Email: ${email}</strong></p>
            <p><strong>Senha Temporária: 12345678</strong></p>
            <p>Para realizar login em sua conta, click <a href="${linkLogin}">Aqui</a> </p>
            <p>É altamente recomendável que você altere sua senha assim que fizer o primeiro login, seguindo as melhores práticas de segurança. Recomendamos:</p>
            <ul>
                <li>Utilizar uma senha forte com pelo menos oito caracteres.</li>
                <li>Incluir letras maiúsculas e minúsculas.</li>
                <li>Incluir números e caracteres especiais.</li>
            </ul>
            <p>
                Agradecemos por se juntar à nossa plataforma e esperamos que tenha uma experiência positiva conosco.
                Se você tiver alguma dúvida ou precisar de assistência, não hesite em nos contatar.
            </p>
            <p>Atenciosamente,<br>Equipe ${companyName}</p>
        </div>
    `;
  return acessAccept;
}

export { getAccessDennyHtml, getAccessAcceptHtml };
