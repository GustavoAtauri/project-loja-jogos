// Função para alternar o Menu Mobile
function toggleMenu() {
    const menu = document.getElementById('navMenu');
    menu.classList.toggle('active');
}

// Lógica do Accordion para o FAQ (Perguntas Frequentes)
function toggleFaq(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('span');
    
    // Opcional: Se quiser que feche as outras respostas ao abrir uma nova, 
    // descomente as linhas abaixo:
    /*
    document.querySelectorAll('.faq-answer').forEach(item => {
        if(item !== answer) {
            item.classList.remove('active');
            // Reseta o ícone dos outros
            if(item.previousElementSibling.querySelector('span')) {
                item.previousElementSibling.querySelector('span').innerText = '+';
            }
        }
    });
    */

    // Alterna a classe 'active' para abrir/fechar
    answer.classList.toggle('active');
    
    // Alterna o ícone entre + e -
    if (icon) {
        icon.innerText = answer.classList.contains('active') ? '-' : '+';
    }
}

// Função de rolagem suave (Smooth Scroll)
function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}