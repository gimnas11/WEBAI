# GAI Chat - AI Programming Assistant

A modern, ChatGPT-like web application built with React, Vite, and TailwindCSS. This application provides an intelligent AI programming assistant powered by OpenAI's GPT-4o or Groq's Llama models, with features like streaming responses, code syntax highlighting, chat history management, and more.

## ✨ Features

- 🤖 **Advanced AI Assistant**: Powered by OpenAI GPT-4o or Groq Llama models with intelligent system prompts for programming tasks
- 💬 **Chat Interface**: Beautiful, responsive UI similar to ChatGPT
- 📝 **Chat History**: Create, rename, delete, and manage multiple chat conversations
- ⚡ **Streaming Responses**: Real-time streaming of AI responses for natural conversation flow
- 💻 **Code Highlighting**: Automatic syntax highlighting for code blocks with copy functionality
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🌙 **Dark Mode**: Modern dark theme optimized for extended use
- 💾 **Local Storage**: All chats and settings stored locally in your browser
- 🔒 **Secure API Key**: API key stored locally, never exposed in source code
- 🚀 **Proxy Mode**: Optional backend proxy for public use without requiring API keys
- 
## 🎨 Customization

### Changing the Base Path

If deploying to a different GitHub Pages path, update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/YOUR-REPO-NAME/',
  // ...
})
```

### Modifying AI Behavior

Edit `src/prompts/systemPrompt.ts` to customize the AI's behavior, personality, and capabilities.

### Styling

The app uses TailwindCSS. Modify `tailwind.config.js` and `src/index.css` to customize the appearance.

## 🔒 Security & Privacy

- **API Key Storage**: Your API key is stored only in your browser's localStorage (when using direct mode)
- **Backend Proxy**: API keys are stored securely on the server (when using proxy mode)
- **No Backend**: Direct mode is fully client-side - no data is sent to any server except OpenAI/Groq
- **Local Storage**: All chat history is stored locally in your browser
- **No Tracking**: No analytics, tracking, or data collection

## 🐛 Troubleshooting

### API Key Issues

- **Invalid API Key Error**: Make sure your API key is correct and has sufficient credits
- **Reset API Key**: Click "Reset API Key" in the sidebar to enter a new key

### Build Issues

- **Module not found**: Run `npm install` again
- **Type errors**: Make sure you're using Node.js 18+ and TypeScript 5+

### Deployment Issues

- **404 on GitHub Pages**: Check that the `base` path in `vite.config.ts` matches your repository name
- **CORS errors**: Make sure you're using the correct base path and the build was successful
- **Proxy not working**: Check that `VITE_PROXY_URL` is set correctly and backend is deployed

## 📝 Usage Tips

1. **Start a New Chat**: Click "New Chat" in the sidebar
2. **Rename Chat**: Hover over a chat in the sidebar and click the edit icon
3. **Delete Chat**: Hover over a chat and click the delete icon
4. **Code Blocks**: Code blocks automatically have syntax highlighting and a copy button
5. **Streaming**: Responses stream in real-time for a natural conversation feel
6. **Context Management**: The app automatically manages context to stay within token limits

## 🤝 Contributing

Feel free to fork this project and customize it for your needs!

## 📄 License

This project is open source and available for personal and commercial use.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Powered by [OpenAI](https://openai.com/) and [Groq](https://groq.com/)
- Bundled with [Vite](https://vitejs.dev/)
- Deployed with [Vercel](https://vercel.com/) and [GitHub Pages](https://pages.github.com/)

---

**Note**: This application requires an API key (either user-provided or via backend proxy) with sufficient credits. You are responsible for any API usage costs.
