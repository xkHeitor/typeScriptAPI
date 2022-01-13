# typeScriptAPI

Typescript API in order to learn and study more about the technology

Uma API montadada com:
* [NodeJS v16.13	          						](https://nodejs.org/en/)
* [Docker version 20.10.12, build e91ed57			](https://www.docker.com)
* [docker-compose version 1.25.0, build unknown		]()

## Instalação

Clone o repositório.

```bash
git clone https://github.com/xkHeitor/typeScriptAPI.git
```

## Utilização

Após termina o clone, é preciso buildar o projeto executando os seguintes comandos na pasta raiz do projeto

```bash
docker-compose up --build -d
```

Caso a imagem não inicie sozinha, execute o comando

```bash
docker-compose start
```

A partir deste momento, a API está aberta para ser utilizado em

```bash
"http://localhost/3000"
```

## Informações adicionais

Para parar a imagem bastar utilizar o comando

```bash
docker-compose stop
```

E caso queira apagar a imagem, com a imagem já parada, basta utilizar

```bash
docker-compose rm -v
```
