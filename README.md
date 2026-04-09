# Microsoft Entra ID Branding Generator

A specialized tool designed to automate the generation of branding assets required for Microsoft Entra ID (formerly Azure AD) custom branding.

## Features

- **Automated Resizing**: Converts a single high-resolution logo into the 6 specific dimensions required by Microsoft.
- **Smart Backgrounds**: Generates a matching 1920x1080 background image based on the dominant colors of your logo.
- **Preview Suite**: View how your logo will look in different contexts (Sign-in, Header, Favicon) before downloading.
- **ZIP Export**: Download all generated assets in a single bundle, ready for upload to the Entra ID portal.
- **URL Fetching**: Import your existing company logo directly via its URL.

## Generated Assets

The tool generates the following 6 assets according to Microsoft's specifications:

1. **Background Image**: 1920 x 1080 px (PNG) - used for the main sign-in page.
2. **Banner Logo**: 245 x 36 px (PNG) - displayed on the sign-in page.
3. **Square Logo (Light)**: 240 x 240 px (PNG) - for Windows and light-mode interfaces.
4. **Square Logo (Dark)**: 240 x 240 px (PNG) - for dark-mode interfaces.
5. **Favicon**: 32 x 32 px (PNG) - browser tab icon.
6. **Header Logo**: 245 x 36 px (PNG) - used in the top-left header of the sign-in experience.

## Technical Stack

- **Framework**: [Next.js](https://nextjs.org/) (TypeScript)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/) (Node.js)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Compression**: [JSZip](https://stuk.github.io/jszip/)

## Local Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Microsoft Entra ID Prerequisites

To apply these assets, you must have:
- A Microsoft Entra ID P1 or P2 license (or equivalent Microsoft 365 license).
- The **Organizational Branding Administrator** role assigned in your tenant.
