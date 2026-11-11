
const SUPABASE_URL = 'https://woktqlmthxlssjwedkfb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_s0G9o6wAAAItIt8zeEpx0g_RdehdUdm';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log('MEDSCRIPT conectado ao Supabase!');

supabaseClient.auth.getSession()
  .then(({ data, error }) => {
    if (error) {
      console.error('Erro na conexão:', error.message);
      return;
    }

    console.log('Conexão com Supabase funcionando!');
    console.log(
      'Usuário conectado:',
      data.session?.user?.email || 'Nenhum usuário conectado'
    );
  });

const medicalFile = document.getElementById('medicalFile');
const uploadButton = document.getElementById('uploadButton');
const fileName = document.getElementById('fileName');
const results = document.getElementById('results');

// Abrir seletor de documentos
uploadButton.addEventListener('click', () => {
  medicalFile.click();
});

// Selecionar documento
medicalFile.addEventListener('change', (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  if (!allowedTypes.includes(file.type)) {
    alert('Formato não permitido. Envie uma imagem ou PDF.');
    medicalFile.value = '';
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('O documento ultrapassa o limite de 10 MB.');
    medicalFile.value = '';
    return;
  }

  fileName.textContent = 'Documento selecionado: ' + file.name;

  results.innerHTML = `
    <div class="empty-state">
      <span>✓</span>
      <p>Documento recebido com sucesso!</p>
      <p>Aguardando processamento.</p>
    </div>
  `;

  console.log('Documento selecionado:', file.name);
});


// Controle do acesso ao MEDSCRIPT
let currentUser = null;

function updateAuthUI(user) {
  currentUser = user;

  const authSection = document.querySelector('.auth-section');
  const uploadSection = document.querySelector('.upload-section');
  const resultSection = document.querySelector('.result-section');
  const loginButton = document.getElementById('loginButton');

  authSection.style.display = user ? 'none' : 'flex';
  uploadSection.style.display = user ? 'block' : 'none';
  resultSection.style.display = user ? 'block' : 'none';

  loginButton.textContent = user ? 'Sair' : 'Entrar';
}

supabaseClient.auth.onAuthStateChange((event, session) => {
  updateAuthUI(session?.user || null);
});


document.getElementById('loginButton').addEventListener('click', async () => {
  if (currentUser) {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      alert('Erro ao sair: ' + error.message);
    }

    return;
  }

  document.querySelector('.auth-section').scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
});

  const authSection = document.querySelector('.auth-section');

  if (authSection) {
    authSection.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    document.getElementById('authEmail').focus();
  }
});

console.log('MEDSCRIPT: configuração inicial carregada.');

// Elementos de autenticação
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authMessage = document.getElementById('authMessage');

// Criar conta
document.getElementById('signUpButton').addEventListener('click', async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || !password) {
    authMessage.textContent = 'Preencha o e-mail e a senha.';
    return;
  }

  if (password.length < 8) {
    authMessage.textContent = 'A senha precisa ter pelo menos 8 caracteres.';
    return;
  }

  authMessage.textContent = 'Criando sua conta...';

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://medscript.pages.dev/'
    }
  });

  if (error) {
    authMessage.textContent = 'Erro: ' + error.message;
    return;
  }

  authMessage.textContent = data.session
    ? 'Conta criada com sucesso!'
    : 'Conta criada! Confira seu e-mail para confirmar o cadastro.';
});

// Entrar na conta
document.getElementById('signInButton').addEventListener('click', async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || !password) {
    authMessage.textContent = 'Preencha o e-mail e a senha.';
    return;
  }

  authMessage.textContent = 'Verificando acesso...';

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    authMessage.textContent = 'Erro ao entrar: ' + error.message;
    return;
  }

  authMessage.textContent = 'Bem-vindo ao MEDSCRIPT!';
  console.log('Usuário autenticado:', data.user.email);
});

