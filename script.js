
const medicalFile = document.getElementById('medicalFile');
const uploadButton = document.getElementById('uploadButton');
const fileName = document.getElementById('fileName');
const results = document.getElementById('results');

// Abrir seletor de documentos
uploadButton.addEventListener('click', () => {
  medicalFile.click();
});

// Quando selecionar um documento
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

  // Limite inicial de 10 MB
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
      <p>O sistema está preparado para a próxima etapa de processamento.</p>
    </div>
  `;

  console.log('Documento selecionado:', file.name);
  console.log('Tipo:', file.type);
  console.log('Tamanho:', file.size);
});

// Botão de login provisório
document.getElementById('loginButton').addEventListener('click', () => {
  alert('O módulo de autenticação será implementado na próxima etapa.');
});
  
