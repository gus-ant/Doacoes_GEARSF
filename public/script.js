const donationItems = {
    hygiene: [
        { name: '🧼 Sabonete', goal: 100, current: 0 },
        { name: '🪥 Pasta de dente', goal: 100, current: 0 },
        { name: '👶 Fraldas infantis/geriátricas', goal: 100, current: 0 },
        { name: '🧍‍♀️ Absorventes', goal: 100, current: 0 },
        { name: '🧻 Papel higiênico', goal: 100, current: 0 }
    ],
    cleaning: [
        { name: '🧽 Detergente', goal: 100, current: 0 },
        { name: '🫧 Sabão em pó/barra', goal: 100, current: 0 },
        { name: '🧴 Desinfetante', goal: 100, current: 0 },
        { name: '💧 Água sanitária', goal: 100, current: 0 }
    ]
};

const donors = [];
const galleryPhotos = [];
const moneyDonations = {
    total: 0,
    donations: []
};


// Navegação
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        showPage(targetId);
    });
});

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    document.querySelector(`[href="#${pageId}"]`).classList.add('active');
}

// Inicializa listas de itens no HTML
function initializeLists() {
    const personalList = document.getElementById('personalHygieneList');
    const cleaningList = document.getElementById('cleaningList');
    const selectElement = document.querySelector('select[name="item"]');

    donationItems.hygiene.forEach(item => {
        personalList.innerHTML += `<li>${item.name}</li>`;
        selectElement.innerHTML += `<option value="${item.name}">${item.name}</option>`;
    });

    donationItems.cleaning.forEach(item => {
        cleaningList.innerHTML += `<li>${item.name}</li>`;
        selectElement.innerHTML += `<option value="${item.name}">${item.name}</option>`;
    });
}

// Atualização das barras de progresso
// Atualiza as barras de progresso com os dados atuais
function updateProgress() {
    const container = document.querySelector('.progress-container');
    container.innerHTML = '';

    [...donationItems.hygiene, ...donationItems.cleaning].forEach(item => {
        const percentage = (item.current / item.goal) * 100;
        container.innerHTML += `
            <div class="glass-card">
                <h4>${item.name}</h4>
                <p>${item.current}/${item.goal} unidades</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    });
}



function updateMoneyProgress() {
    const moneyContainer = document.querySelector('.money-progress');
    if (!moneyContainer) return;

    const formattedTotal = moneyDonations.total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    // Lista individual de doações (opcional, você pode remover essa parte se quiser só o total)
    const donationsList = moneyDonations.donations.map(d => {
        const formattedValue = d.value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        return `<li>${d.name} — ${formattedValue}${d.message ? ` (${d.message})` : ''}</li>`;
    }).join('');

    moneyContainer.innerHTML = `
        <div class="glass-card money-card">
            <h3>💰 Total Arrecadado em Dinheiro</h3>
            <p class="money-amount">${formattedTotal}</p>
        </div>
    `;
}


// Login functionality

document.getElementById('adminLogin')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('donationRegistration').style.display = 'block';
        document.getElementById('photoUploadForm').reset();
        document.getElementById('uploadPreview').innerHTML = '';
        e.target.reset();
    } else {
        alert('Credenciais inválidas', username, password);
    }
});


// Logout functionality
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('donationRegistration').style.display = 'none';
});

// Move form to registration page and hide initially
const donationForm = document.getElementById('donationRegistration');
if (donationForm) {
    donationForm.style.display = 'none';
}



// Carrega dados das planilhas do servidor
// Carrega dados das planilhas do servidor
async function loadData() {
    try {
        // ✅ 1. Busca os dados combinados do servidor
        const response = await fetch('/dados-planilha');
        const data = await response.json();

        const itens = data.itens; // Dados da planilha de itens
        const dinheiro = data.dinheiro; // Dados da planilha de dinheiro

        // ✅ 2. Processa doações de itens
        itens.forEach(entry => {
            const name = entry.Nome || entry.nome;
            const itemName = entry.Item || entry.item;
            const qty = entry.Quantidade || entry.quantidade;

            if (name && itemName && qty) {
                donors.push(name);

                [...donationItems.hygiene, ...donationItems.cleaning].forEach(item => {
                    if (item.name.toLowerCase().includes(itemName.toLowerCase())) {
                        item.current += parseInt(qty);
                    }
                });
            }
        });

        // ✅ 3. Processa doações em dinheiro
        dinheiro.forEach(entry => {
            const name = entry.Nome || entry.nome;
            const value = entry.Valor || entry.valor;
            const message = entry.Mensagem || entry.mensagem;

            if (name && value) {
                donors.push(name);
                const numericValue = parseFloat(value.replace(',', '.'));
                moneyDonations.total += numericValue;
                moneyDonations.donations.push({ name, value: numericValue, message });
            }
        });

        // ✅ 4. Atualiza a interface
        updateProgress();
        updateDonorsWall();
        updateMoneyProgress();
        updateGallery();

    } catch (error) {
        console.error('❌ Erro ao carregar dados da planilha:', error);
    }
}



// Save data to MongoDB via Express
async function saveData() {
    const data = {
        donationItems,
        donors,
        galleryPhotos,
        moneyDonations
    };
    
    try {
        const response = await fetch('http://localhost:3000/save-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Dados salvos com sucesso no MongoDB!');
        } else {
            console.error('Erro ao salvar:', result.error);
        }
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
    }
}


// Registro de doações
document.getElementById('donationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const donation = {
        item: formData.get('item'),
        quantity: parseInt(formData.get('quantity')),
        donor: formData.get('donor'),
        notes: formData.get('notes'),
        date: new Date()
    };

    const allItems = [...donationItems.hygiene, ...donationItems.cleaning];
    const item = allItems.find(i => i.name === donation.item);
    if (item) {
        item.current += donation.quantity;
    }

    if (donation.donor) {
        donors.push(donation.donor);
    }

    updateProgress();
    updateDonorsWall();
    e.target.reset();
    showThankYouModal();
    
    // Save data after update
    await saveData();
});

// Registro de doações em dinheiro
document.getElementById('moneyDonationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(e.target.amount.value);
    const donor = e.target.moneyDonor.value;
    
    if (amount > 0) {
        moneyDonations.total += amount;
        moneyDonations.donations.push({
            amount,
            donor,
            date: new Date()
        });
        
        updateMoneyProgress();
        if (donor) {
            donors.push(donor);
            updateDonorsWall();
        }
        e.target.reset();
        showThankYouModal();
        
        // Save data after update
        await saveData();
    }
});

// Mural de doadores
// Mural de doadores (nomes únicos)
function updateDonorsWall() {
    const donorsWall = document.getElementById('donorsWall');
    if (!donorsWall) return;

    donorsWall.innerHTML = '';
    const uniqueDonors = [...new Set(donors)];

    uniqueDonors.forEach(donor => {
        if (donor && donor.trim()) {
            const donorCard = document.createElement('div');
            donorCard.className = 'donor-card';
            donorCard.innerHTML = `<p>❤️ ${donor}</p>`;
            donorsWall.appendChild(donorCard);
        }
    });

    if (uniqueDonors.length === 0) {
        donorsWall.innerHTML = '<div class="donor-card"><p>Seja o primeiro a doar!</p></div>';
    }
}

// Modal de agradecimento
function showThankYouModal() {
    const modal = document.getElementById('thankYouModal');
    modal.style.display = 'block';
    
    const totalProgress = calculateTotalProgress();
    modal.querySelector('.total-progress').innerHTML = `
        <h3>Meta Total Atingida: ${totalProgress}%</h3>
    `;

    setTimeout(() => {
        modal.style.display = 'none';
    }, 3000);
}

function calculateTotalProgress() {
    const allItems = [...donationItems.hygiene, ...donationItems.cleaning];
    const total = allItems.reduce((acc, item) => acc + (item.current / item.goal), 0);
    return Math.round((total / allItems.length) * 100);
}

// Foto upload handler
async function handlePhotoUpload(e) {
    e.preventDefault();
    const file = document.getElementById('photoInput').files[0];
    const caption = document.getElementById('photoCaption').value;
    
    if (file && caption) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const photo = {
                src: e.target.result,
                caption: caption,
                date: new Date()
            };
            galleryPhotos.unshift(photo);
            updateGallery();
            showPreview(photo);
            document.getElementById('photoUploadForm').reset();
            
            // Save data after update
            await saveData();
        };
        reader.readAsDataURL(file);
    }
}

function showPreview(photo) {
    const preview = document.getElementById('uploadPreview');
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.innerHTML = `
        <img src="${photo.src}" alt="${photo.caption}">
        <div class="caption">${photo.caption}</div>
    `;
    preview.insertBefore(previewItem, preview.firstChild);
}

function updateGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = galleryPhotos.map(photo => `
        <div class="gallery-item">
            <img src="${photo.src}" alt="${photo.caption}">
            <div class="caption">${photo.caption}</div>
        </div>
    `).join('');
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Load saved data first
    await loadData();
    
    // Show home page by default
    showPage('home');
    
    initializeLists();
    updateProgress();
    updateDonorsWall();
    updateMoneyProgress();
    updateGallery();
    
    const photoUploadForm = document.getElementById('photoUploadForm');
    if (photoUploadForm) {
        photoUploadForm.addEventListener('submit', handlePhotoUpload);
    }
    
    document.querySelectorAll('.subpage-button').forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.target;
            
            // Hide all subpage content
            document.querySelectorAll('.subpage-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show selected content
            if (target === 'donors') {
                document.getElementById('donors-content').classList.add('active');
            } else if (target === 'photos') {
                document.getElementById('photos-content').classList.add('active');
            }
            
            // Highlight active button
            document.querySelectorAll('.subpage-button').forEach(btn => {
                btn.style.background = 'var(--glass-bg)';
            });
            button.style.background = 'rgba(255, 255, 255, 0.2)';
        });
    });

    // Show donors content by default
    document.querySelector('[data-target="donors"]').click();
});