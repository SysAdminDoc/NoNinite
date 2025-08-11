# NoNinite: Winget & Chocolatey Script Generator

**NoNinite** is a playful, alternative take on [ninite.com](https://ninite.com/) created mainly for my own workflow.  
Instead of downloading classic Ninite installers, this userscript keeps the familiar `ninite.com` domain but transforms it into a modern package management tool using **[Winget](https://learn.microsoft.com/windows/package-manager/winget/)** and **[Chocolatey](https://chocolatey.org/)**.

With NoNinite, you can:
- Browse and search a large catalog of applications (many more than standard Ninite).
- Quickly select apps and generate install scripts for Winget, Chocolatey, or both.
- Use presets and stacks to speed up your workflow.
- Customize script generation options (silent installs, scope, bootstrap script, etc.).
- Export or import your presets and configuration.

## Why I Made This
Ninite has been a massive help to me for many years and their service played a huge role in me becoming the IT technician I am today.  
This project is not about replacing or competing with Ninite. I wish them nothing but the best.  

NoNinite is mostly a personal experiment to help me discourage my own use of Ninite installers and instead adopt modern packaging standards that are more flexible for scripting and automation.

---

## How It Works
When installed, the userscript runs on `https://ninite.com/` and replaces its functionality with a custom interface:
1. Select applications from categories or search.
2. Choose your package manager(s): Winget and/or Chocolatey.
3. Configure install options in settings.
4. Generate a script (PowerShell bootstrap or plain commands) you can run anywhere.

---

## Installation
You will need a userscript manager in your browser:
- **[Violentmonkey](https://violentmonkey.github.io/)**
- **[Tampermonkey](https://www.tampermonkey.net/)**
- **[Greasemonkey](https://www.greasespot.net/)** (less recommended)

Once installed, click here to add NoNinite:  
[**📥 Install NoNinite Userscript**](https://github.com/SysAdminDoc/NoNinite/raw/refs/heads/main/src/NoNinite.user.js)

---

## Features at a Glance
- Large App Catalog from maintained JSON lists, far more than default Ninite.
- Quick Presets such as Fresh Windows Install, Helpdesk Tools, Developer Workstation.
- Stacks Sidebar to filter by role (browsers, dev, media, portable, security, etc.).
- Script Customization with silent installs, non-interactive mode, accept agreements, and more.
- Config Management to export or import settings and presets.

---

## Example Presets
| Name                     | Notes                          | Sample Apps |
|--------------------------|--------------------------------|-------------|
| Fresh Windows Install    | General workstation setup      | Chrome, 7-Zip, VLC, PowerToys |
| Helpdesk Tools           | Remote support and triage      | AnyDesk, WizTree, Revo Uninstaller |
| Developer Workstation    | Common dev stack               | VS Code, Git, Docker Desktop |
| Privacy and Security     | Basic hardening                | Bitwarden, KeePassXC, VeraCrypt |

---

## Disclaimer
This tool is not affiliated with or endorsed by Ninite.com.  
It is for personal and educational use, and is intended as a convenience for those who want to use Winget or Chocolatey instead of Ninite’s installers.

---

## License
MIT License. See [LICENSE](LICENSE) for details.
