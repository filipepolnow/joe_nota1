

document.addEventListener('DOMContentLoaded', () => {
    const inputCep = document.getElementById('cep');
    const buttonBuscarCep = document.getElementById('buscar-cep');
    const divResultado = document.getElementById('resultado');
    const newsDiv = document.getElementById('news');

    const apiKey = "0dae514324710c84194ab6ec0a17ea5a";
    const newsApiKey = "155d16c418c146e4be4d9bf7995f4385";

    buttonBuscarCep.addEventListener('click', () => {
        const cep = inputCep.value.replace(/\D/g, ''); // Remove caracteres não numéricos do CEP
        if (cep.length !== 8) {
            divResultado.innerHTML = '<p>CEP inválido. O CEP deve conter 8 dígitos numéricos.</p>';
            return;
        }

        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar CEP.');
                }
                return response.json();
            })
            .then(data => {
                if (data.erro) {
                    divResultado.innerHTML = '<p>CEP não encontrado.</p>';
                } else {
                    divResultado.innerHTML = `
                        <p><strong>CEP:</strong> ${data.cep}</p>
                        <p><strong>Logradouro:</strong> ${data.logradouro}</p>
                        <p><strong>Bairro:</strong> ${data.bairro}</p>
                        <p><strong>Cidade:</strong> ${data.localidade}</p>
                        <p><strong>Estado:</strong> ${data.uf}</p>
                    `;
                    const city = data.localidade;
                    fetchWeather(city);
                    fetchNews(city);
                }
            })
            .catch(error => {
                divResultado.innerHTML = `<p>${error.message}</p>`;
            });
    });

    async function fetchWeather(city) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
            if (response.ok) {
                const data = await response.json();
                displayWeather(data);
            } else {
                throw new Error('Erro ao buscar dados meteorológicos:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao buscar dados meteorológicos:', error.message);
        }
    }

    function displayWeather(data) {
        if (data && data.name) {
            const weatherDiv = document.getElementById('weather');
            weatherDiv.innerHTML = `
                <h2>Dados Meteorológicos para ${data.name}</h2>
                <p><strong>Temperatura:</strong> ${data.main.temp}°C</p>
                <p><strong>Condição:</strong> ${data.weather[0].description}</p>
                <p><strong>Umidade:</strong> ${data.main.humidity}%</p>
            `;
        } else {
            console.error('Erro ao exibir dados meteorológicos: Dados inválidos ou cidade não encontrada.');
        }
    }

    async function fetchNews(city) {
        try {
            const response = await fetch(`https://newsapi.org/v2/everything?q=${city}&pageSize=5&apiKey=${newsApiKey}`);
            if (response.ok) {
                const data = await response.json();
                displayNews(data);
            } else {
                throw new Error('Erro ao buscar notícias:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao buscar notícias:', error.message);
        }
    }

    function displayNews(data) {
        if (data && data.articles && data.articles.length > 0) {
            let newsHTML = '<h2>Notícias Relacionadas</h2>';
            data.articles.forEach(article => {
                newsHTML += `
                    <div>
                        <h3>${article.title}</h3>
                        <p>${article.description}</p>
                        <a href="${article.url}" target="_blank">Leia mais</a>
                    </div>
                `;
            });
            newsDiv.innerHTML = newsHTML;
        } else {
            newsDiv.innerHTML = '<p>Nenhuma notícia encontrada.</p>';
        }
    }
});
