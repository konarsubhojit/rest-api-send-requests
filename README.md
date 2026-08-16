# REST API Request Tool

A modern, accessible REST API testing tool built with React and TypeScript. This tool provides an intuitive interface for testing REST APIs with features like automatic URL parsing, secure token management, and comprehensive response display.

**Deployed app:** https://rest-api-send-requests.pages.dev

![API Request Tool](https://img.shields.io/badge/React-19.x-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue.svg)
![Accessibility](https://img.shields.io/badge/a11y-WCAG%202.1-green.svg)

## ✨ Features

### 🔗 **Smart URL Management**
- **Granular URL Input**: Separate base URL and path fields for better organization
- **Auto URL Parsing**: Paste any full URL and it automatically separates into base URL and path
- **Real-time Preview**: See the complete URL as you build it

### 🔐 **Secure Authentication**
- **Bearer Token Support**: Secure token input with show/hide functionality
- **Privacy-First**: Tokens are hidden by default and use password input type
- **Easy Management**: One-click edit and hide functionality

### 📊 **Comprehensive Request Building**
- **Multiple HTTP Methods**: Support for GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- **Dynamic Parameters**: Add unlimited key-value parameters
- **Smart Parameter Handling**: Automatic query parameters for GET, JSON body for others
- **Input Validation**: Real-time validation and helpful error messages

### 🎯 **Rich Response Display**
- **Status Visualization**: Clear success/error status indicators
- **Detailed Headers**: Complete response header information
- **Formatted Response**: Syntax-highlighted JSON and text responses
- **Error Handling**: Comprehensive error messages and timeout handling

### ♿ **Accessibility First**
- **WCAG 2.1 Compliant**: Full screen reader support
- **Keyboard Navigation**: Complete keyboard accessibility
- **ARIA Labels**: Proper semantic markup and labels
- **Focus Management**: Logical tab order and focus indicators

### 🚀 **Performance Optimized**
- **Component Architecture**: Modular, reusable components
- **Memoization**: Optimized re-renders with React.memo and useCallback
- **TypeScript**: Full type safety and IntelliSense support
- **Custom Hooks**: Clean separation of concerns

### 📁 **Saved Collections**
- Save named requests locally and organize them into folders
- Rename, duplicate, delete, import, and export collections
- Share requests using URL fragments without uploading them
- Authorization tokens and `Authorization` header values are always replaced with a placeholder
  before save/export and excluded from shared links. Re-enter them after loading.

### 🌐 **Optional CORS Proxy**
- Direct browser requests remain the default
- Likely CORS failures suggest the configured proxy
- Proxied responses retain upstream status, readable headers, and body, including errors
- Responses identify whether they were fetched directly or through the proxy
- Credentialed proxy requests require confirmation every time

## 🛠️ **Installation & Setup**

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/konarsubhojit/rest-api-send-requests.git
   cd rest-api-send-requests
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 **Usage Guide**

### Basic API Testing

1. **Set up your endpoint**
   - Enter your API base URL (e.g., `https://api.example.com`)
   - Add the specific path (e.g., `/users/123`)
   - Or paste a complete URL in either field for auto-separation

2. **Choose HTTP method**
   - Select from GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS

3. **Add authentication (optional)**
   - Enter your Bearer token
   - Use the hide/show functionality for security

4. **Configure parameters**
   - Add key-value pairs for your request
   - GET requests: Parameters become URL query parameters
   - Other methods: Parameters become JSON request body

5. **Send request**
   - Click "Send Request" to execute
   - View detailed response including status, headers, and body

### Advanced Features

- **URL Auto-Parsing**: Paste `https://api.github.com/users/octocat` in the base URL field to automatically separate it
- **Parameter Management**: Add unlimited parameters with the "Add Parameter" button
- **Response Analysis**: Examine headers, status codes, and formatted response data
- **Error Handling**: Clear error messages for network issues, timeouts, and API errors

## Cloudflare proxy setup

The proxy is intentionally **opt-in** and the toggle is hidden unless configured.

1. Deploy the Worker and its Durable Object:
   ```bash
   cd worker
   npx wrangler deploy
   ```
2. Set `REACT_APP_PROXY_URL` to the deployed Worker URL when building:
   ```bash
   REACT_APP_PROXY_URL=https://rest-api-cors-proxy.example.workers.dev npm run build
   ```
   For GitHub deployment, create a repository variable with that name.
3. Configure `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.
   Cloudflare Pages previews deploy for pull requests. Without secrets, tests and builds still run
   while deploy steps skip.

### Proxy security model and limitations

An unrestricted proxy is an abuse and SSRF risk. This Worker accepts only HTTP(S), resolves and
checks A/AAAA answers against private, loopback, link-local, unique-local, reserved, and multicast
ranges, re-validates every redirect, removes hop-by-hop headers, enforces 1 MiB request and 5 MiB
response limits, applies a 15-second timeout, and rate-limits each source IP with a Durable Object.
Cloudflare's free plan also enforces its 100,000 requests/day account limit.

DNS validation reduces SSRF risk but cannot provide the same isolation as a dedicated egress
firewall. Public DNS and destination ownership can change, response headers may contain sensitive
data, and users can deliberately send credentials through the Worker after confirming the warning.
Operate your own Worker, monitor it, choose a conservative `PER_IP_DAILY_LIMIT`, and do not enable
the proxy for requests you do not trust.

## 🏗️ **Project Structure**

```
src/
├── components/          # Reusable UI components
│   ├── UrlInput.tsx    # URL input with auto-parsing
│   ├── AuthTokenInput.tsx  # Secure token management
│   ├── ParametersInput.tsx # Key-value parameter editor
│   └── ResponseDisplay.tsx # Response visualization
├── hooks/              # Custom React hooks
│   └── useApiRequest.ts    # API request logic
├── types/              # TypeScript type definitions
│   └── api.ts          # API-related interfaces
├── utils/              # Utility functions
│   ├── constants.ts    # Application constants
│   └── urlUtils.ts     # URL manipulation utilities
├── App.tsx             # Main application component
├── App.css             # Application styles
└── index.tsx           # Application entry point
```

## 🧪 **Testing**

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## 🔧 **Available Scripts**

- `npm run dev` - Start development server
- `npm test` - Run test suite
- `npm run build` - Build for production

## 🎨 **Customization**

### Styling
The application uses CSS modules with a clean, modern design. Customize styles in:
- `src/App.css` - Main application styles
- Component-specific styles within each component file

### API Configuration
Modify default settings in `src/utils/constants.ts`:
- Request timeout duration
- Default headers
- Supported HTTP methods

## 🔒 **Security Features**

- **Token Security**: Bearer tokens use password input type and are hidden by default
- **Input Sanitization**: Proper input validation and sanitization
- **CORS Handling**: Direct by default with an explicitly enabled, hardened proxy
- **Timeout Protection**: 30-second request timeout to prevent hanging requests

## 🌐 **Browser Support**

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## 📱 **Mobile Support**

Fully responsive design that works on:
- 📱 Mobile phones
- 📟 Tablets
- 💻 Desktop computers

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with [Vite](https://vite.dev/)
- Icons and design inspiration from modern API tools
- Accessibility guidelines from [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Made with ❤️ for developers who need to test APIs quickly and efficiently.**
