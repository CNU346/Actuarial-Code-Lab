
document.addEventListener('DOMContentLoaded', function(){
    // Simple smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    document.querySelector('#inquiry').onsubmit = function (){
        let subject = document.querySelector('#reqpack').value;
        let body = `Good day,
        I would like to request to be enrolled for the tutorials as indicated in the subject.
        `;
        window.open(`mailto:caviemunyanyi@gmail.com?subject=${subject}&body=${body}`);
    }
})
