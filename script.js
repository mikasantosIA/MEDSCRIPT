
const SUPABASE_URL = 'https://woktqlmthxlssjwedkfb.supabase.co';
const SUPABASE_KEY = 'COLE_AQUI_SUA_PUBLISHABLE_KEY';

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

// Login provisório
document.getElementById('loginButton').addEventListener('click', () => {
  alert('O módulo de autenticação será implementado na próxima etapa.');
});

console.log('MEDSCRIPT: configuração inicial carregada.');
  
