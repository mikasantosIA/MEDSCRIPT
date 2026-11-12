
const SUPABASE_URL = 'https://woktqlmthxlssjwedkfb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_s0G9o6wAAAItIt8zeEpx0g_RdehdUdm';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log('MEDSCRIPT conectado ao Supabase!');

// Usuário autenticado
let currentUser = null;

// Elementos da página
const medicalFile = document.getElementById('medicalFile');
const uploadButton = document.getElementById('uploadButton');
const fileName = document.getElementById('fileName');
const results = document.getElementById('results');

const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authMessage = document.getElementById('authMessage');

// Atualizar tela conforme o login
function updateAuthUI(user) {
  currentUser = user;

  const authSection = document.querySelector('.auth-section');
  const uploadSection = document.querySelector('.upload-section');
  const resultSection = document.querySelector('.result-section');
  const loginButton = document.getElementById('loginButton');

  if (authSection) {
    authSection.style.display = user ? 'none' : 'flex';
  }

  if (uploadSection) {
    uploadSection.style.display = user ? 'block' : 'none';
  }

  if (resultSection) {
    resultSection.style.display = user ? 'block' : 'none';
  }

  if (loginButton) {
    loginButton.textContent = user ? 'Sair' : 'Entrar';
  }
}

// Monitorar autenticação
supabaseClient.auth.onAuthStateChange((event, session) => {
  updateAuthUI(session?.user || null);

  setTimeout(() => {
    loadMedicalDocuments();
  }, 0);
});

// Botão Entrar / Sair do cabeçalho
document.getElementById('loginButton').addEventListener('click', async () => {
  if (currentUser) {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      alert('Erro ao sair: ' + error.message);
    }

    return;
  }

  const authSection = document.querySelector('.auth-section');

  if (authSection) {
    authSection.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    authEmail.focus();
  }
});

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

// Abrir seletor de documentos
uploadButton.addEventListener('click', () => {
  medicalFile.click();
});

// Enviar documento para o Supabase
medicalFile.addEventListener('change', async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  if (!currentUser) {
    alert('Faça login para enviar documentos.');
    return;
  }

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

  fileName.textContent = 'Enviando documento...';

  const storagePath =
    currentUser.id + '/' + Date.now() + '_' + file.name;

  const { error: uploadError } = await supabaseClient
    .storage
    .from('medical-orders')
    .upload(storagePath, file);

  if (uploadError) {
    fileName.textContent = 'Erro ao enviar: ' + uploadError.message;
    return;
  }

  const { error: databaseError } = await supabaseClient
    .from('medical_documents')
    .insert({
      user_id: currentUser.id,
      original_filename: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      file_size: file.size,
      status: 'pending'
    });

  if (databaseError) {
    await supabaseClient
      .storage
      .from('medical-orders')
      .remove([storagePath]);

    fileName.textContent = 'Erro ao registrar: ' + databaseError.message;
    return;
  }

  fileName.textContent = 'Documento enviado: ' + file.name;

  results.innerHTML = `
    <div class="empty-state">
      <span>✓</span>
      <p>Documento salvo com sucesso!</p>
      <p>Aguardando processamento.</p>
    </div>
  `;

  medicalFile.value = '';
});

console.log('MEDSCRIPT: configuração carregada.');

// Carregar histórico de documentos
async function loadMedicalDocuments() {
  const documentsList = document.getElementById('documentsList');

  if (!currentUser) {
    documentsList.innerHTML = '';
    return;
  }

  documentsList.innerHTML = '<p>Carregando documentos...</p>';

  const { data, error } = await supabaseClient
    .from('medical_documents')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (error) {
    documentsList.innerHTML =
      '<p>Erro ao carregar documentos: ' + error.message + '</p>';
    return;
  }

  if (!data || data.length === 0) {
    documentsList.innerHTML =
      '<p>Nenhum documento enviado ainda.</p>';
    return;
  }

  documentsList.innerHTML = '';

  data.forEach((doc) => {
    const item = document.createElement('div');
    item.className = 'document-item';

    const date = new Date(doc.created_at).toLocaleString('pt-BR');

   item.innerHTML = `
  <div>
    <strong></strong>
    <p>Enviado em: ${date}</p>
    <small>Status: ${doc.status}</small>
  </div>

  <div class="document-actions">
    <button type="button" class="open-document-button">
      Abrir documento
    </button>

    <button type="button" class="analyze-document-button">
      Analisar com IA
    </button>
  </div>
`;

    item.querySelector('strong').textContent = doc.original_filename;

    item.querySelector('button').addEventListener('click', async () => {
      const { data: fileData, error: fileError } =
        await supabaseClient.storage
          .from('medical-orders')
          .createSignedUrl(doc.storage_path, 60);

      if (fileError) {
        alert('Erro ao abrir documento: ' + fileError.message);
        return;
      }

      window.open(fileData.signedUrl, '_blank');
    });

    documentsList.appendChild(item);
  });
}

