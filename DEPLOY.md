# Guia de Deploy (Como colocar no Celular)

Para usar o **Money Travel** no seu celular como um aplicativo real, siga os passos abaixo.

## 1. Publicar na Internet (Vercel)

A maneira mais fácil e gratuita é usar a **Vercel**.

### Pré-requisitos
- Uma conta no [GitHub](https://github.com).
- Uma conta na [Vercel](https://vercel.com) (pode entrar com o GitHub).

### Passo a Passo
1.  **Suba o código para o GitHub** (se ainda não fez):
    - Crie um novo repositório no GitHub.
    - No terminal do projeto, rode:
      ```bash
      git init
      git add .
      git commit -m "Primeira versão"
      git branch -M main
      git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
      git push -u origin main
      ```

2.  **Conecte na Vercel**:
    - Vá em [vercel.com/new](https://vercel.com/new).
    - Selecione o repositório que você acabou de criar.
    - Clique em **Deploy**.
    - A Vercel vai detectar que é um projeto Vite/React automaticamente.
    - Aguarde uns segundos e... **Sucesso!** Você terá um link (ex: `money-travel.vercel.app`).

## 2. Instalar no Celular (PWA)

Agora que você tem o link, abra ele no navegador do seu celular.

### No iPhone (iOS)
1.  Abra o link no **Safari**.
2.  Toque no botão **Compartilhar** (ícone do quadrado com seta para cima).
3.  Role para baixo e toque em **"Adicionar à Tela de Início"** (Add to Home Screen).
4.  Dê um nome (ex: Money Travel) e confirme.
5.  O ícone vai aparecer junto com seus outros apps.

### No Android (Chrome)
1.  Abra o link no **Chrome**.
2.  Geralmente aparece um aviso "Adicionar Money Travel à tela inicial". Toque nele.
3.  Se não aparecer, toque nos **três pontinhos** (menu) > **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.

## Funcionamento Offline
O app salva seus dados no navegador do celular. Se ficar sem internet, você ainda consegue ver seus dados e adicionar novos gastos, e ele sincroniza quando voltar (se tivermos configurado backend, mas como é local, tudo fica salvo no seu aparelho para sempre).

**Atenção**: Se você limpar os dados do navegador, perde os dados do app.
