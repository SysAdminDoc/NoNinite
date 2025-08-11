// ==UserScript==
// @name         NoNinite: Winget & Chocolatey Script Generator
// @namespace    https://github.com/SysAdminDoc/NoNinite
// @version      3.3.4
// @description  NoNinite is a userscript that transforms ninite.com. It keeps the familiar domain but replaces every function of the site adding more applications, customization tools, and using modern package managers (Winget and Chocolatey) instead of old-school Ninite installers.
// @author       Matthew Parker
// @match        https://ninite.com/
// @icon         https://raw.githubusercontent.com/SysAdminDoc/NoNinite/refs/heads/main/assets/icons/favicon.ico
// @downloadURL  https://github.com/SysAdminDoc/NoNinite/raw/refs/heads/main/NoNinite.user.js
// @updateURL    https://github.com/SysAdminDoc/NoNinite/raw/refs/heads/main/NoNinite.user.js
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_listValues
// @grant        GM_deleteValue
// @connect      raw.githubusercontent.com
// @connect      icons.duckduckgo.com
// @connect      www.google.com
// @connect      s2.googleusercontent.com
// @require      https://code.jquery.com/jquery-3.6.4.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/masonry/4.2.2/masonry.pkgd.min.js
// @require      https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.min.js
// @run-at       document-start
// ==/UserScript==

/* jshint esversion: 8 */

// Hide the body immediately to prevent FOUC (Flash of Unstyled Content)
GM_addStyle('body { visibility: hidden; }');

(async function () {
    'use strict';

    // ---------- Defaults (built-ins) ----------
    const defaultAppData = {}; // This will be populated from the fetched source

    const faviconOverrides = {
        "1password": "https://1password.com/favicon.ico",
        "7zip": "https://www.7-zip.org/7ziplogo.png",
        "Adobe Acrobat Reader DC": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Adobe_Acrobat_DC_logo_2020.svg/256px-Adobe_Acrobat_DC_logo_2020.svg.png",
        "AdvancedRenamer": "https://www.advancedrenamer.com/favicon.ico",
        "Aegisub": "https://raw.githubusercontent.com/Aegisub/Aegisub/master/aegisub/bitmaps/icons/aegisub.ico",
        "affine": "https://affine.pro/favicon.ico",
        "aimp": "https://www.aimp.ru/favicon.ico",
        "Alacritty": "https://raw.githubusercontent.com/alacritty/alacritty/master/extra/logo/alacritty-simple.svg",
        "AmbieWhiteNoise": "https://ambieapp.com/favicon.ico",
        "anaconda3": "https://www.anaconda.com/favicon.ico",
        "angryipscanner": "https://angryip.org/favicon.ico",
        "Anki": "https://apps.ankiweb.net/logo.svg",
        "anydesk": "https://anydesk.com/favicon.ico",
        "Audacity": "https://www.audacityteam.org/favicon.svg",
        "autodarkmode": "https://raw.githubusercontent.com/AutoDarkMode/Windows-Auto-Night-Mode/master/Assets/Icons/AppIcon.ico",
        "autohotkey": "https://www.autohotkey.com/favicon.ico",
        "autoruns": "https://learn.microsoft.com/favicon.ico",
        "azuredatastudio": "https://azure.microsoft.com/favicon.ico",
        "barrier": "https://raw.githubusercontent.com/debauchee/barrier/master/res/barrier.ico",
        "bat": "https://raw.githubusercontent.com/sharkdp/bat/master/assets/bat_logo.svg",
        "betterbird": "https://www.betterbird.eu/favicon.ico",
        "bitwarden": "https://bitwarden.com/favicon.ico",
        "bleachbit": "https://www.bleachbit.org/favicon.ico",
        "blender": "https://www.blender.org/favicon.ico",
        "BorderlessGaming": "https://raw.githubusercontent.com/Codeusa/Borderless-Gaming/master/resources/Icon.ico",
        "brave": "https://brave.com/static-assets/images/brave-favicon.svg",
        "bulkcrapuninstaller": "https://www.bcuninstaller.com/favicon.ico",
        "bulkrenameutility": "https://www.bulkrenameutility.co.uk/favicon.ico",
        "calibre": "https://calibre-ebook.com/favicon.ico",
        "capframex": "https://www.capframex.com/favicon.ico",
        "Carnac": "http://carnackeys.com/images/octocat-2x.png",
        "cemu": "https://cemu.info/favicon.ico",
        "chatterino": "https://chatterino.com/favicon.ico",
        "chrome": "https://www.google.com/chrome/static/images/favicons/favicon-96x96.png",
        "chromium": "https://www.chromium.org/favicon.ico",
        "clementine": "https://www.clementine-player.org/favicon.ico",
        "Clink": "https://raw.githubusercontent.com/chrisant996/clink/master/clink/res/clink.ico",
        "clonehero": "https://clonehero.net/favicon.ico",
        "cmake": "https://cmake.org/favicon.ico",
        "CompactGUI": "https://raw.githubusercontent.com/ImminentFate/CompactGUI/master/Compact/Images/app.ico",
        "copyq": "https://hluk.github.io/CopyQ/favicon.ico",
        "cpuz": "https://www.cpuid.com/favicon.ico",
        "croc": "https://schollz.com/favicon.ico",
        "crystaldiskinfo": "https://crystalmark.info/favicon.ico",
        "crystaldiskmark": "https://crystalmark.info/favicon.ico",
        "darktable": "https://www.darktable.org/favicon.ico",
        "DaxStudio": "https://daxstudio.org/favicon.ico",
        "ddu": "https://www.wagnardsoft.com/favicon.ico",
        "deluge": "https://deluge-torrent.org/favicon.ico",
        "devtoys": "https://devtoys.app/favicon.ico",
        "digikam": "https://www.digikam.org/favicon.ico",
        "discord": "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico",
        "dismtools": "https://github.com/Chuyu-Team/DISMTools/raw/master/DISMTools/Resources/DISMTools.ico",
        "ditto": "https://ditto-cp.sourceforge.io/favicon.ico",
        "dmt": "https://www.daemon-tools.cc/favicon.ico",
        "dockerdesktop": "https://www.docker.com/favicon.ico",
        "dotnet3": "https://dotnet.microsoft.com/favicon.ico",
        "dotnet5": "https://dotnet.microsoft.com/favicon.ico",
        "dotnet6": "https://dotnet.microsoft.com/favicon.ico",
        "dotnet7": "https://dotnet.microsoft.com/favicon.ico",
        "dotnet8": "https://dotnet.microsoft.com/favicon.ico",
        "dotnet9": "https://dotnet.microsoft.com/favicon.ico",
        "dropox": "https://www.dropbox.com/static/images/favicon.ico",
        "duplicati": "https://www.duplicati.com/favicon.ico",
        "eaapp": "https://www.ea.com/favicon.ico",
        "EarTrumpet": "https://raw.githubusercontent.com/File-New-Project/EarTrumpet/main/Assets/EarTrumpet.png",
        "edge": "https://www.microsoft.com/favicon.ico",
        "efibooteditor": "https://github.com/dakanji/EfiBootEditor/raw/main/resources/icon.ico",
        "emulationstation": "https://emulationstation.org/favicon.ico",
        "epicgames": "https://www.epicgames.com/favicon.ico",
        "EqualizerAPO": "https://sourceforge.net/p/equalizerapo/icon",
        "esearch": "https://github.com/xupefei/EverythingToolbar/raw/master/src/EverythingToolbar/Resources/App.ico",
        "espanso": "https://espanso.org/favicon.ico",
        "ExifCleaner": "https://exifcleaner.com/favicon.ico",
        "falkon": "https://www.falkon.org/favicon.ico",
        "FanControl": "https://raw.githubusercontent.com/Rem0o/FanControl.Releases/master/FanControl/Resources/FanControl.ico",
        "fastfetch": "https://raw.githubusercontent.com/fastfetch-cli/fastfetch/dev/presets/fastfetch.png",
        "ferdium": "https://ferdium.org/favicon.ico",
        "ffmpeg": "https://ffmpeg.org/favicon.ico",
        "fileconverter": "https://file-converter.io/favicon.ico",
        "files": "https://files.community/favicon.ico",
        "firealpaca": "https://firealpaca.com/favicon.ico",
        "firefox": "https://www.mozilla.org/media/img/favicons/firefox/browser/favicon.dde5f6d25496.ico",
        "firefoxesr": "https://www.mozilla.org/media/img/favicons/firefox/browser/favicon.dde5f6d25496.ico",
        "flameshot": "https://flameshot.org/favicon.ico",
        "floorp": "https://floorp.app/favicon.ico",
        "flow": "https://flowlauncher.com/favicon.ico",
        "flux": "https://justgetflux.com/favicon.ico",
        "fnm": "https://raw.githubusercontent.com/Schniz/fnm/master/logo.png",
        "foobar": "https://www.foobar2000.org/favicon.ico",
        "ForceAutoHDR": "https://github.com/emoose/ForceAutoHDR/raw/main/resources/icon.ico",
        "Fork": "https://git-fork.com/favicon.ico",
        "foxpdfeditor": "https://www.foxit.com/favicon.ico",
        "foxpdfreader": "https://www.foxit.com/favicon.ico",
        "freecad": "https://www.freecad.org/favicon.ico",
        "fxsound": "https://www.fxsound.com/favicon.ico",
        "fzf": "https://raw.githubusercontent.com/junegunn/fzf/master/README.md/favicon.png",
        "geforcenow": "https://www.nvidia.com/favicon.ico",
        "gimp": "https://www.gimp.org/favicon.ico",
        "git": "https://git-scm.com/favicon.ico",
        "gitbutler": "https://gitbutler.com/favicon.ico",
        "gitextensions": "https://gitextensions.github.io/favicon.ico",
        "githubcli": "https://github.githubassets.com/favicons/favicon.svg",
        "githubdesktop": "https://desktop.github.com/favicon.ico",
        "gitify": "https://www.gitify.io/favicon.ico",
        "gitkrakenclient": "https://www.gitkraken.com/favicon.ico",
        "glaryutilities": "https://www.glarysoft.com/favicon.ico",
        "glazewm": "https://raw.githubusercontent.com/glzr-io/glazewm/main/assets/icon.ico",
        "godotengine": "https://godotengine.org/favicon.ico",
        "gog": "https://www.gog.com/favicon.ico",
        "golang": "https://go.dev/favicon.ico",
        "googledrive": "https://ssl.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png",
        "gpuz": "https://www.techpowerup.com/favicon.ico",
        "greenshot": "https://getgreenshot.org/favicon.ico",
        "gsudo": "https://raw.githubusercontent.com/gerardog/gsudo/master/logo/gsudo.ico",
        "guilded": "https://www.guilded.gg/favicon.ico",
        "handbrake": "https://handbrake.fr/favicon.ico",
        "harmonoid": "https://harmonoid.com/favicon.ico",
        "heidisql": "https://www.heidisql.com/favicon.ico",
        "helix": "https://helix-editor.com/favicon.ico",
        "heroiclauncher": "https://heroicgameslauncher.com/favicon.ico",
        "hexchat": "https://hexchat.github.io/favicon.ico",
        "hwinfo": "https://www.hwinfo.com/favicon.ico",
        "hwmonitor": "https://www.cpuid.com/favicon.ico",
        "imageglass": "https://imageglass.org/favicon.ico",
        "imgburn": "https://www.imgburn.com/favicon.ico",
        "inkscape": "https://inkscape.org/favicon.ico",
        "intelpresentmon": "https://www.intel.com/favicon.ico",
        "itch": "https://itch.io/favicon.ico",
        "itunes": "https://www.apple.com/favicon.ico",
        "jami": "https://jami.net/favicon.ico",
        "java11": "https://www.java.com/favicon.ico",
        "java17": "https://www.java.com/favicon.ico",
        "java21": "https://www.java.com/favicon.ico",
        "java8": "https://www.java.com/favicon.ico",
        "jdownloader": "https://jdownloader.org/favicon.ico",
        "jellyfinmediaplayer": "https://jellyfin.org/images/favicon.ico",
        "jellyfinserver": "https://jellyfin.org/images/favicon.ico",
        "jetbrains": "https://www.jetbrains.com/favicon.ico",
        "joplin": "https://joplinapp.org/favicon.ico",
        "JoyToKey": "https://joytokey.net/favicon.ico",
        "jpegview": "https://sourceforge.net/p/jpegview/icon",
        "kdeconnect": "https://kdeconnect.kde.org/favicon.ico",
        "kdenlive": "https://kdenlive.org/favicon.ico",
        "keepass": "https://keepass.info/favicon.ico",
        "kicad": "https://www.kicad.org/favicon.ico",
        "klite": "https://codecguide.com/favicon.ico",
        "kodi": "https://kodi.tv/favicon.ico",
        "krita": "https://krita.org/favicon.ico",
        "lazygit": "https://github.com/jesseduffield/lazygit/raw/master/assets/logo.png",
        "LenovoLegionToolkit": "https://raw.githubusercontent.com/BartoszCichecki/LenovoLegionToolkit/main/src/LenovoLegionToolkit.WinUI/Assets/Logo.ico",
        "libreoffice": "https://www.libreoffice.org/favicon.ico",
        "LibreWolf": "https://librewolf.net/favicon.ico",
        "lightshot": "https://app.prntscr.com/favicon.ico",
        "Link Shell Extension": "https://schinagl.priv.at/favicon.ico",
        "linphone": "https://www.linphone.org/favicon.ico",
        "livelywallpaper": "https://rocksdanister.github.io/lively/favicon.ico",
        "localsend": "https://localsend.org/favicon.ico",
        "lockhunter": "https://lockhunter.com/favicon.ico",
        "Logseq": "https://raw.githubusercontent.com/logseq/logseq/master/resources/icons/icon.png",
        "magicwormhole": "https://magic-wormhole.readthedocs.io/en/latest/_static/favicon.ico",
        "malwarebytes": "https://www.malwarebytes.com/favicon.ico",
        "masscode": "https://masscode.io/favicon.ico",
        "matrix": "https://matrix.org/favicon.ico",
        "meld": "https://meldmerge.org/favicon.ico",
        "miniconda": "https://docs.conda.io/en/latest/_static/favicon.ico",
        "ModernFlyouts": "https://raw.githubusercontent.com/ModernFlyouts-Community/ModernFlyouts/main/ModernFlyouts/Assets/StoreLogo.png",
        "monitorian": "https://github.com/emoacht/Monitorian/raw/master/Monitorian/Images/AppIcon.ico",
        "moonlight": "https://moonlight-stream.org/favicon.ico",
        "Motrix": "https://motrix.app/favicon.ico",
        "mp3tag": "https://www.mp3tag.de/favicon.ico",
        "mpchc": "https://mpc-hc.org/favicon.ico",
        "mremoteng": "https://mremoteng.org/favicon.ico",
        "msedgeredirect": "https://github.com/rcmaehl/MSEdgeRedirect/raw/master/Resources/icon.ico",
        "msiafterburner": "https://www.msi.com/favicon.ico",
        "MuEditor": "https://codewith.mu/favicon.ico",
        "mullvadbrowser": "https://mullvad.net/favicon.ico",
        "Mullvad VPN": "https://raw.githubusercontent.com/mullvad/mullvadvpn-app/main/dist-assets/icon.ico",
        "musescore": "https://musescore.org/favicon.ico",
        "musicbee": "https://getmusicbee.com/favicon.ico",
        "nanazip": "https://github.com/M2Team/NanaZip/raw/main/Assets/NanaZip.ico",
        "naps2": "https://www.naps2.com/favicon.ico",
        "nditools": "https://ndi.tv/favicon.ico",
        "neofetchwin": "https://raw.githubusercontent.com/dylanaraps/neofetch/master/neofetch.png",
        "neovim": "https://neovim.io/favicon.ico",
        "netbird": "https://netbird.io/favicon.ico",
        "nextclouddesktop": "https://nextcloud.com/favicon.ico",
        "nglide": "https://www.zeus-software.com/img/favicon.ico",
        "nilesoftShell": "https://nilesoft.org/favicon.ico",
        "nmap": "https://nmap.org/favicon.ico",
        "nodejs": "https://nodejs.org/static/images/favicons/favicon.ico",
        "nodejslts": "https://nodejs.org/static/images/favicons/favicon.ico",
        "nomacs": "https://nomacs.org/favicon.ico",
        "notepadplus": "https://notepad-plus-plus.org/favicon.ico",
        "nTrace": "https://www.zeus-software.com/downloads/ntrace/favicon.ico",
        "nuget": "https://nuget.org/favicon.ico",
        "nushell": "https://www.nushell.sh/favicon.ico",
        "nvclean": "https://www.techpowerup.com/favicon.ico",
        "nvm": "https://raw.githubusercontent.com/nvm-sh/nvm/master/logo.svg",
        "obs": "https://obsproject.com/favicon.ico",
        "obsidian": "https://obsidian.md/favicon.ico",
        "OFGB": "https://github.com/Aetopia/OFGB/raw/main/icon.ico",
        "Oh My Posh": "https://ohmyposh.dev/img/favicon.ico",
        "okular": "https://okular.kde.org/favicon.ico",
        "onedrive": "https://onedrive.live.com/favicon.ico",
        "onlyoffice": "https://www.onlyoffice.com/favicon.ico",
        "OPAutoClicker": "https://opautoclicker.com/favicon.ico",
        "openhashtab": "https://github.com/namazso/OpenHashTab/raw/master/installer/OpenHashTab.ico",
        "openrgb": "https://openrgb.org/favicon.ico",
        "openscad": "https://openscad.org/favicon.ico",
        "openshell": "https://open-shell.github.io/Open-Shell-Menu/favicon.ico",
        "OpenVPN": "https://openvpn.net/favicon.ico",
        "orcaslicer": "https://github.com/SoftFever/OrcaSlicer/raw/main/resources/icons/orca256.png",
        "OVirtualBox": "https://www.virtualbox.org/favicon.ico",
        "ownclouddesktop": "https://owncloud.com/favicon.ico",
        "Paintdotnet": "https://www.getpaint.net/favicon.ico",
        "PaleMoon": "https://www.palemoon.org/favicon.ico",
        "parsec": "https://parsec.app/favicon.ico",
        "pdf24creator": "https://tools.pdf24.org/favicon.ico",
        "pdfgear": "https://www.pdfgear.com/favicon.ico",
        "pdfsam": "https://pdfsam.org/favicon.ico",
        "peazip": "https://peazip.github.io/peazip.ico",
        "piimager": "https://www.raspberrypi.com/favicon.ico",
        "pixi": "https://pixi.sh/favicon.ico",
        "playnite": "https://playnite.link/favicon.ico",
        "plex": "https://www.plex.tv/wp-content/themes/plex/assets/img/favicons/favicon-32x32.png",
        "plexdesktop": "https://www.plex.tv/wp-content/themes/plex/assets/img/favicons/favicon-32x32.png",
        "Portmaster": "https://safing.io/favicon.ico",
        "posh": "https://ohmyposh.dev/img/favicon.ico",
        "postman": "https://www.postman.com/favicon.ico",
        "powerautomate": "https://powerautomate.microsoft.com/favicon.ico",
        "powerbi": "https://powerbi.microsoft.com/favicon.ico",
        "powershell": "https://learn.microsoft.com/favicon.ico",
        "powertoys": "https://learn.microsoft.com/favicon.ico",
        "prismlauncher": "https://prismlauncher.org/favicon.ico",
        "processlasso": "https://bitsum.com/favicon.ico",
        "processmonitor": "https://learn.microsoft.com/favicon.ico",
        "prucaslicer": "https://github.com/prusa3d/PrusaSlicer/raw/master/resources/icons/256x256.png",
        "PS Remote Play": "https://remoteplay.dl.playstation.net/remoteplay/favicon.ico",
        "PulsarEdit": "https://pulsar-edit.dev/favicon.ico",
        "PuTTY": "https://www.chiark.greenend.org.uk/~sgtatham/putty/putty.ico",
        "pyenv": "https://raw.githubusercontent.com/pyenv-win/pyenv-win/master/pyenv-win.ico",
        "python3": "https://www.python.org/static/favicon.ico",
        "qbittorrent": "https://www.qbittorrent.org/favicon.ico",
        "qgis": "https://qgis.org/favicon.ico",
        "qtox": "https://qtox.github.io/favicon.ico",
        "quicklook": "https://pooi.moe/QuickLook/favicon.ico",
        "rainmeter": "https://www.rainmeter.net/favicon.ico",
        "rdcman": "https://learn.microsoft.com/favicon.ico",
        "revo": "https://www.revouninstaller.com/favicon.ico",
        "Revolt": "https://revolt.chat/favicon.svg",
        "ripgrep": "https://raw.githubusercontent.com/BurntSushi/ripgrep/master/rg.ico",
        "rufus": "https://rufus.ie/favicon.ico",
        "rustdesk": "https://rustdesk.com/favicon.ico",
        "rustlang": "https://www.rust-lang.org/favicon.ico",
        "sagethumbs": "https://sourceforge.net/p/sagethumbs/icon",
        "sandboxie": "https://sandboxie-plus.com/favicon.ico",
        "sdio": "https://www.snappy-driver-installer.org/favicon.ico",
        "session": "https://getsession.org/favicon.ico",
        "sharex": "https://getsharex.com/favicon.ico",
        "Shotcut": "https://shotcut.org/favicon.ico",
        "sidequest": "https://sidequestvr.com/favicon.ico",
        "signal": "https://signal.org/favicon.ico",
        "signalrgb": "https://signalrgb.com/favicon.ico",
        "simplenote": "https://simplenote.com/favicon.ico",
        "simplewall": "https://www.henrypp.org/favicon.ico",
        "slack": "https://slack.com/favicon.ico",
        "smplayer": "https://smplayer.info/favicon.ico",
        "spacedrive": "https://spacedrive.com/favicon.ico",
        "spacesniffer": "https://www.uderzo.it/main_products/space_sniffer/favicon.ico",
        "spotify": "https://open.spotifycdn.com/cdn/images/favicon32.b64ecc03.png",
        "sqlmanagementstudio": "https://learn.microsoft.com/favicon.ico",
        "starship": "https://starship.rs/favicon.ico",
        "steam": "https://store.steampowered.com/favicon.ico",
        "strawberry": "https://www.strawberrymusicplayer.org/favicon.ico",
        "stremio": "https://www.stremio.com/favicon.ico",
        "sublimemerge": "https://www.sublimemerge.com/favicon.ico",
        "sublimetext": "https://www.sublimetext.com/favicon.ico",
        "SubtitleEdit": "https://www.nikse.dk/Files/Images/Logo/SubEdit.ico",
        "sumatra": "https://www.sumatrapdfreader.org/favicon.ico",
        "sunshine": "https://app.lizardbyte.dev/favicon.ico",
        "superf4": "https://stefansundin.github.io/superf4/favicon.ico",
        "swift": "https://www.swift.org/favicon.ico",
        "syncthingtray": "https://github.com/Martchus/syncthingtray/raw/master/resources/icons/org.syncthing.sttray-256.png",
        "synctrayzor": "https://synctrayzor.syncthing.net/favicon.ico",
        "Tabby": "https://raw.githubusercontent.com/Eugeny/tabby/master/app/resources/linux-icons/128x128.png",
        "tagscanner": "https://www.xdlab.ru/favicon.ico",
        "tailscale": "https://tailscale.com/favicon.ico",
        "TcNoAccSwitcher": "https://tcno.co/favicon.ico",
        "tcpview": "https://learn.microsoft.com/favicon.ico",
        "teams": "https://www.microsoft.com/favicon.ico",
        "teamviewer": "https://www.teamviewer.com/favicon.ico",
        "telegram": "https://web.telegram.org/favicon.ico",
        "temurin": "https://adoptium.net/favicon.ico",
        "TeraCopy": "https://www.codesector.com/favicon.ico",
        "terminal": "https://raw.githubusercontent.com/microsoft/terminal/main/res/terminal.ico",
        "Thonny": "https://thonny.org/favicon.ico",
        "thorium": "https://thorium.rocks/favicon.ico",
        "thunderbird": "https://www.thunderbird.net/media/img/thunderbird/favicon.ico",
        "tidal": "https://tidal.com/favicon.ico",
        "tightvnc": "https://www.tightvnc.com/favicon.ico",
        "tixati": "https://www.tixati.com/favicon.ico",
        "tor": "https://www.torproject.org/favicon.ico",
        "totalcommander": "https://www.ghisler.com/favicon.ico",
        "transmission": "https://transmissionbt.com/favicon.ico",
        "treesize": "https://www.jam-software.com/favicon.ico",
        "ttaskbar": "https://t-tweak.com/favicon.ico",
        "twinkletray": "https://twinkletray.com/favicon.ico",
        "ubisoft": "https://www.ubisoft.com/favicon.ico",
        "Ueli": "https://raw.githubusercontent.com/oliverschwendener/ueli/master/assets/icon/icon.png",
        "ultravnc": "https://www.uvnc.com/favicon.ico",
        "Ungoogled Chromium": "https://raw.githubusercontent.com/ungoogled-software/ungoogled-chromium/master/app/resources/product_logo_256.png",
        "Unigram": "https://raw.githubusercontent.com/UnigramDev/Unigram/develop/Unigram/Assets/Square44x44Logo.altform-unplated_targetsize-256.png",
        "unity": "https://unity.com/favicon.ico",
        "vagrant": "https://www.vagrantup.com/favicon.ico",
        "vc2015_32": "https://learn.microsoft.com/favicon.ico",
        "vc2015_64": "https://learn.microsoft.com/favicon.ico",
        "ventoy": "https://www.ventoy.net/favicon.ico",
        "vesktop": "https://github.com/Vencord/Vesktop/raw/main/assets/icon.png",
        "viber": "https://www.viber.com/favicon.ico",
        "videomass": "https://videomass.github.io/favicon.ico",
        "Virtual Desktop Streamer": "https://www.vrdesktop.net/favicon.ico",
        "Virtual Volumes View": "https://www.xdlab.ru/favicon.ico",
        "vistaswitcher": "https://www.ntwind.com/favicon.ico",
        "visualstudio": "https://visualstudio.microsoft.com/favicon.ico",
        "vivaldi": "https://vivaldi.com/favicon.ico",
        "VLC": "https://www.videolan.org/favicon.ico",
        "voicemeeter": "https://vb-audio.com/VoicemeeterBanana/favicon.ico",
        "VoicemeeterPotato": "https://vb-audio.com/VoicemeeterPotato/favicon.ico",
        "vscode": "https://code.visualstudio.com/favicon.ico",
        "VSCodium": "https://vscodium.com/favicon.ico",
        "waterfox": "https://www.waterfox.net/favicon.ico",
        "wazuh": "https://wazuh.com/favicon.ico",
        "wezterm": "https://wezfurlong.org/wezterm/favicon.ico",
        "Windhawk": "https://ramensoftware.com/favicon.ico",
        "WindowGrid": "https://windowgrid.net/favicon.ico",
        "windowsfirewallcontrol": "https://www.binisoft.org/favicon.ico",
        "windowspchealth": "https://learn.microsoft.com/favicon.ico",
        "wingetui": "https://github.com/marticliment/WingetUI/raw/main/logo.ico",
        "winmerge": "https://winmerge.org/favicon.ico",
        "winpaletter": "https://github.com/Abdelrhman-AK/WinPaletter/raw/main/WinPaletter/Resources/Icons/WinPaletter.ico",
        "winrar": "https://www.win-rar.com/favicon.ico",
        "WinSCP": "https://winscp.net/favicon.ico",
        "wireguard": "https://www.wireguard.com/favicon.ico",
        "wireshark": "https://www.wireshark.org/favicon.ico",
        "WiseProgramUninstaller": "https://www.wisecleaner.com/favicon.ico",
        "wisetoys": "https://toys.wisetoys.cn/favicon.ico",
        "wizfile": "https://wizfile.net/favicon.ico",
        "wiztree": "https://wiztreefree.com/favicon.ico",
        "xdm": "https://xtremedownloadmanager.com/images/xdm_logo.png",
        "xeheditor": "https://xehub.io/favicon.ico",
        "xemu": "https://xemu.app/favicon.ico",
        "xnview": "https://www.xnview.com/favicon.ico",
        "xournal": "https://xournal.sourceforge.net/favicon.ico",
        "xpipe": "https://xpipe.io/favicon.ico",
        "Xtreme Download Manager": "https://xtremedownloadmanager.com/images/xdm_logo.png",
        "Yarn": "https://yarnpkg.com/img/yarn-favicon.svg",
        "ytdlp": "https://github.com/yt-dlp/yt-dlp/raw/master/devscripts/logo.png",
        "ZenBrowser": "https://zen-browser.app/favicon.ico",
        "zerotierone": "https://www.zerotier.com/favicon.ico",
        "Zim": "https://raw.githubusercontent.com/zim-desktop-wiki/zim-desktop-wiki/master/data/icons/48x48/zim.png",
        "znote": "https://znote.io/favicon.ico",
        "zoom": "https://zoom.us/favicon.ico",
        "zoomit": "https://learn.microsoft.com/favicon.ico",
        "zotero": "https://www.zotero.org/favicon.ico",
        "zoxide": "https://github.com/ajeetdsouza/zoxide/raw/main/assets/logo.png",
        "Zulip": "https://raw.githubusercontent.com/zulip/zulip-desktop/main/build/icon.ico"
    };

    const defaultPresets = [
        { name: "Fresh Windows Install", notes: "General user workstation", items: ["Chrome", "7-Zip", "VLC", "Spotify", "PowerShell 7", "Microsoft PowerToys", "Windows Terminal"] },
        { name: "Helpdesk Tools", notes: "Remote support and triage", items: ["AnyDesk", "TeamViewer", "7-Zip", "Everything", "Revo Uninstaller", "WizTree"] },
        { name: "Developer Workstation", notes: "Common dev stack", items: ["VS Code", "Git", "Node.js", "Python 3", "Windows Terminal", "Docker Desktop", "Notepad++", "WinSCP", "PuTTY"] },
        { name: "Remote Support Lite", notes: "Bare essentials", items: ["AnyDesk", "7-Zip", "Everything"] },
        { name: "Media/Streaming", notes: "Creators and streamers", items: ["VLC", "Audacity", "HandBrake", "ShareX"] },
        { name: "Privacy/Security", notes: "Hardening basics", items: ["Bitwarden", "KeePassXC", "VeraCrypt", "Firefox"] },
        { name: "IT Admin Work-from-a-USB", notes: "Portable-leaning toolbox for field work", items: ["7-Zip", "Everything", "Notepad++", "PuTTY", "WinSCP", "WizTree", "TreeSize Free", "ShareX", "Greenshot", "Firefox"] }
    ];

    const defaultStacks = ["browsers", "dev", "remote", "media", "portable", "security"];
    const defaultAppTags = {
        "Chrome": ["browsers"], "Firefox": ["browsers", "security"], "Edge": ["browsers"], "Brave": ["browsers", "security"], "Opera": ["browsers"], "Vivaldi": ["browsers"],
        "VS Code": ["dev"], "Git": ["dev"], "Node.js": ["dev"], "Python 3": ["dev"], "Windows Terminal": ["dev"], "Docker Desktop": ["dev"], "Notepad++": ["dev", "portable"],
        "PuTTY": ["dev", "remote", "portable"], "WinSCP": ["dev", "remote", "portable"], "FileZilla": ["dev", "remote"],
        "AnyDesk": ["remote"], "TeamViewer": ["remote"], "VNC Viewer": ["remote"],
        "VLC": ["media"], "Audacity": ["media"], "HandBrake": ["media"], "ShareX": ["media", "portable"], "Greenshot": ["media", "portable"],
        "7-Zip": ["portable"], "Everything": ["portable"], "WizTree": ["portable"], "TreeSize Free": ["portable"],
        "Bitwarden": ["security"], "KeePassXC": ["security"], "VeraCrypt": ["security"]
    };

    // ---------- Persistent State ----------
    const state = loadState();

    function loadState() {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const storedTheme = GM_getValue('theme');
        const defaultTheme = storedTheme === undefined ? 'dark' : storedTheme;

        const storedAppData = GM_getValue('appData');
        const appData = storedAppData && Object.keys(storedAppData).length > 0 ? storedAppData : structuredClone(defaultAppData);

        return {
            theme: GM_getValue('theme', defaultTheme),
            hiddenCategories: GM_getValue('hiddenCategories', {}),
            collapsedCategories: GM_getValue('collapsedCategories', {}),
            versions: GM_getValue('versions', {}),
            options: GM_getValue('options', {
                wingetScope: 'machine',
                wingetSilent: true,
                wingetDisableInteractivity: true,
                wingetAccept: true,
                chocoY: true,
                chocoNoProgress: true,
                bootstrap: true,
                enableWinget: true,
                enableChoco: true,
                enableStacks: false
            }),
            presets: GM_getValue('presets', structuredClone(defaultPresets)),
            appData,
            appTags: GM_getValue('appTags', structuredClone(defaultAppTags)),
            stacks: GM_getValue('stacks', structuredClone(defaultStacks)),
            editMode: GM_getValue('editMode', false)
        };
    }

    function saveState() {
        GM_setValue('theme', state.theme);
        GM_setValue('hiddenCategories', state.hiddenCategories);
        GM_setValue('collapsedCategories', state.collapsedCategories);
        GM_setValue('versions', state.versions);
        GM_setValue('options', state.options);
        GM_setValue('presets', state.presets);
        GM_setValue('appData', state.appData);
        GM_setValue('appTags', state.appTags);
        GM_setValue('stacks', state.stacks);
        GM_setValue('editMode', state.editMode);
    }

    // ---------- App Data Fetching ----------
    async function fetchAndProcessApps() {
        const storedData = GM_getValue('appData');
        const lastFetch = GM_getValue('lastFetchTime', 0);
        const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours

        if (storedData && Object.keys(storedData).length > 0 && (Date.now() - lastFetch < cacheDuration)) {
            console.log("NoNinite: Loaded application list from local cache.");
            return Promise.resolve(storedData);
        }

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://raw.githubusercontent.com/ChrisTitusTech/winutil/refs/heads/main/config/applications.json',
                onload: function (response) {
                    try {
                        const rawData = JSON.parse(response.responseText);
                        const processedData = {};
                        for (const appKey in rawData) {
                            if (Object.hasOwnProperty.call(rawData, appKey)) {
                                const appInfo = rawData[appKey];
                                const category = appInfo.category || 'Uncategorized';
                                if (!processedData[category]) processedData[category] = [];
                                const app = {
                                    name: appInfo.content || appKey,
                                    wingetId: Array.isArray(appInfo.winget) ? appInfo.winget[0] : appInfo.winget,
                                    chocoId: appInfo.choco,
                                    link: appInfo.link || '#',
                                    description: appInfo.description || ''
                                };
                                if (app.wingetId || app.chocoId) processedData[category].push(app);
                            }
                        }
                        GM_setValue('appData', processedData);
                        GM_setValue('lastFetchTime', Date.now());
                        console.log("NoNinite: Fetched and saved new application list.");
                        resolve(processedData);
                    } catch (e) {
                        console.error('Error parsing application JSON:', e);
                        reject('Failed to parse application list.');
                    }
                },
                onerror: function (error) {
                    console.error('Error fetching application list:', error);
                    reject('Failed to fetch application list.');
                }
            });
        });
    }

    // ---------- Styles ----------
    GM_addStyle(`
    :root {
        --bg-dark: #121212; --bg-light: #f8f9fa;
        --panel-dark: #1e1e1e; --panel-light: #ffffff;
        --text-dark: #e0e0e0; --text-light: #212529;
        --accent: #0d47a1; --accent-hover: #1565c0; --accent-glow: rgba(13, 71, 161, 0.4);
        --border-dark: #333; --border-light: #dee2e6;
        --chip-bg-dark: rgba(255, 255, 255, 0.1); --chip-bg-light: #e9ecef;
        --highlight: #ffc107; --danger: #d32f2f; --danger-hover: #b71c1c;
        --font-sans: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    }
    @keyframes pulse-glow {
        0% { transform: scale(1); box-shadow: 0 0 4px rgba(41, 182, 246, 0.5), 0 0 8px rgba(41, 182, 246, 0.3); }
        50% { transform: scale(1.03); box-shadow: 0 0 8px rgba(41, 182, 246, 0.8), 0 0 16px rgba(41, 182, 246, 0.5); }
        100% { transform: scale(1); box-shadow: 0 0 4px rgba(41, 182, 246, 0.5), 0 0 8px rgba(41, 182, 246, 0.3); }
    }
    html, body { font-family: var(--font-sans); height: 100%; margin: 0; overflow-x: hidden; scroll-behavior: smooth; }
    body.dark-theme { background: var(--bg-dark) !important; color: var(--text-dark); }
    body.light-theme { background: var(--bg-light) !important; color: var(--text-light); }

    /* Layout */
    #pro-control-app-container { display: flex; flex-direction: column; min-height: 100vh; }
    #main-content { display: flex; flex-grow: 1; gap: 24px; padding: 24px; }
    #left-rail { width: 240px; flex: 0 0 240px; position: sticky; top: 120px; align-self: flex-start; }
    #main-rail { flex: 1; min-width: 0; }

    /* Header */
    #app-header { position: sticky; top: 0; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    #sticky-header-content { background-color: #0d47a1; padding: 2px 10px 2px 10px; color: #ffffff; }
    #header-top-row { display: flex; justify-content: space-between; align-items: center; }
    #header-title-wrap { display: flex; align-items: center; gap: 12px; }
    #header-logo { width: 32px; height: 32px; }
    #app-title { font-size: 24px; font-weight: 600; color: #fff; }
    #app-subtitle { font-size: 14px; font-weight: 300; opacity: 0.8; margin-left: 8px; color: #fff; }
    #header-controls { display: flex; align-items: center; gap: 8px; }
    #header-controls .control-btn svg, #header-controls .primary-btn { color: #fff; }

    /* Selection & Toolbar */
    #selection-info-bar { display: flex; align-items: center; gap: 16px; min-height: 40px; margin: 0; padding: 0; }
    #selection-chips { display: flex; flex-wrap: wrap; gap: 8px; flex-grow: 1; }
    #toolbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin-top: 12px; margin-bottom: 4px; }
    #search-wrap { flex: 1 1 300px; position: relative; }
    #global-search { width: 100%; padding: 12px 40px 12px 16px; border-radius: 8px; outline: none; transition: all 0.2s ease-in-out; font-size: 15px; color: var(--text-dark); }
    #global-search:focus { border-color: var(--highlight); box-shadow: 0 0 0 4px rgba(255,193,7,0.4); }
    #search-hint { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; color: var(--text-dark); opacity: 0.6; }

    /* Buttons & Controls */
    .btn { border-radius: 8px; font-weight: 600; padding: 10px 16px; border: 1px solid transparent; cursor: pointer; transition: all 0.2s ease-in-out; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
    .primary-btn { background: #1976d2; color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
    .primary-btn:hover { background: #1565c0; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(25,118,210,0.4); }
    .primary-btn:disabled { background: #555; cursor: not-allowed; transform: none; box-shadow: none; opacity: 0.6; animation: none; }
    .primary-btn.exciting-btn:not(:disabled) { animation: pulse-glow 2.5s infinite ease-in-out; }
    body.light-theme .primary-btn:disabled { background: #ccc; }
    .secondary-btn { border: 1px solid var(--border-dark); background: transparent; }
    body.dark-theme .secondary-btn { color: var(--text-dark); }
    body.light-theme .secondary-btn { border-color: var(--border-light); color: var(--text-light); }
    .secondary-btn:hover { background: var(--chip-bg-dark); border-color: var(--accent-hover); }
    body.light-theme .secondary-btn:hover { background: var(--chip-bg-light); }
    .control-btn { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer; transition: all .2s; }
    .control-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.1); }
    select.btn { text-align: left; }
    .chip { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 16px; font-size: 13px; transition: all 0.2s ease; cursor: pointer; }
    .chip:hover { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.2); background: var(--danger); color: #fff; }
    .chip:hover .src { color: #fff; }

    /* App Grid */
    .homepage-app-section { transition: all .3s; border-radius: 12px; padding: 20px; margin: 8px !important; width: calc(33.333% - 16px) !important; }
    body.dark-theme .homepage-app-section { background: var(--panel-dark); border: 1px solid var(--border-dark); }
    body.light-theme .homepage-app-section { background: var(--panel-light); border: 1px solid var(--border-light); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .category-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; gap: 8px; }
    .category-title-wrap { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 600; }
    .app-list { list-style: none; padding-left: 0; max-height: 1000px; overflow: hidden; transition: max-height .4s ease-in-out, margin .4s; margin-top: 16px; }
    .app-list.collapsed { max-height: 0; margin-top: 0 !important; }
    .app-item-label { display: flex; align-items: center; justify-content: space-between; padding: 10px 8px; border-radius: 8px; gap: 8px; transition: background-color 0.2s; cursor: pointer; }
    .app-item-label:hover, .app-item-label.kb-highlight { background: var(--accent-glow); }
    .app-item-label.selected { background: var(--accent-glow); border: 1px solid var(--accent); }
    .app-left { display: flex; align-items: center; gap: 10px; pointer-events: none; }
    .app-favicon { width: 16px; height: 16px; border-radius: 3px; flex-shrink: 0; background-color: rgba(255,255,255,0.1); }
    .app-delete { display: none; color: var(--danger); cursor: pointer; font-weight: 700; pointer-events: auto !important; }
    .install-options { pointer-events: none; }
    .install-options label { display: inline-flex; align-items: center; gap: 5px; margin-left: 8px; font-size: 13px; opacity: .9; }

    /* Modals */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000; display: none; align-items: center; justify-content: center; opacity: 0; transition: opacity .3s; backdrop-filter: blur(5px); }
    .modal { position: relative; width: 95%; max-width: 1100px; border-radius: 16px; overflow: hidden; transform: scale(.95); transition: transform .3s; display: flex; flex-direction: column; max-height: 90vh; }
    body.dark-theme .modal { background: var(--panel-dark); border: 1px solid var(--border-dark); box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
    body.light-theme .modal { background: var(--panel-light); border: 1px solid var(--border-light); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border-dark); flex-shrink: 0; }
    body.light-theme .modal-header { border-color: var(--border-light); }
    .modal-close-btn { position: absolute; top: 12px; right: 12px; width:36px; height:36px; border-radius:50%; }
    .modal-body { padding: 24px; overflow: auto; }
    .settings-modal-body { display: grid; grid-template-columns: repeat(auto-fit,minmax(320px,1fr)); gap: 24px; }
    .settings-group { display: flex; flex-direction: column; gap: 16px; border: 1px solid var(--border-dark); padding: 16px; border-radius: 12px; }
    body.light-theme .settings-group { border-color: var(--border-light); }
    .settings-group h3 { margin: 0 0 8px 0; padding-bottom: 8px; border-bottom: 1px solid var(--border-dark); }
    body.light-theme .settings-group h3 { border-color: var(--border-light); }
    .settings-group label, .settings-group .toolbar-row { display: flex; align-items: center; justify-content: flex-start; gap: 8px; }
    .settings-group select, .settings-group textarea { width: 100%; }

    /* Script Modal */
    .script-modal-body { padding: 0 24px 16px 24px; overflow: auto; }
    .script-output-wrap { margin-bottom: 16px; }
    .script-output-wrap h3 { display: flex; justify-content: space-between; align-items: center; }
    .script-output-wrap textarea { width: 100%; min-height: 200px; font-family: 'Fira Code', 'Consolas', monospace; font-size: 13px; border-radius: 8px; padding: 12px; border: 1px solid var(--border-dark); }
    body.dark-theme .script-output-wrap textarea { background: #111; color: #f3f3f3; }
    body.light-theme .script-output-wrap textarea { background-color: #f8f9fa; border-color: var(--border-light); }
    .script-modal-footer { padding: 16px 24px; display: flex; justify-content: space-between; gap: 10px; border-top: 1px solid var(--border-dark); }
    body.light-theme .script-modal-footer { border-color: var(--border-light); }

    /* Custom Tooltip */
    #app-tooltip {
        position: absolute;
        z-index: 10002;
        padding: 15px;
        border-radius: 12px;
        max-width: 350px;
        pointer-events: auto;
        transition: opacity 0.2s ease-in-out;
    }
    body.dark-theme #app-tooltip { background: #2a2a2a; border: 1px solid #444; box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
    body.light-theme #app-tooltip { background: #ffffff; border: 1px solid #ccc; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
    #app-tooltip-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    #app-tooltip-favicon { width: 32px; height: 32px; flex-shrink: 0; }
    #app-tooltip-name { font-size: 16px; font-weight: 700; }
    #app-tooltip-desc { font-size: 14px; margin-bottom: 12px; line-height: 1.5; }
    #app-tooltip-link { font-size: 13px; font-weight: 600; text-decoration: none; }
    body.dark-theme #app-tooltip-link { color: #64b5f6; }
    body.light-theme #app-tooltip-link { color: #0277bd; }
    #app-tooltip-link:hover { text-decoration: underline; }

    /* Custom Overrides */
    #get-script-btn { background-color: #263238; }
    button.control-btn { color: #fafafa; background-color: transparent; }
    button.control-btn:hover { color: #fff; }
    #global-search { background-color: #212121; border-style: none; }
    span.src { color: #29b6f6; }
    button.secondary-btn.btn.clear-btn { margin-top: 3px; margin-bottom: -10px; background-color: #fb8c00; color: #ffebee; border: none; }
    select#preset-select.secondary-btn.btn { color: #fafafa; background-color: #212121; }
    button.secondary-btn.btn { color: #fafafa; }
    div.chip { background-color: transparent; border: 1px solid var(--border-dark); }

    .hidden { display: none !important; }
    #loading-indicator { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 20px; padding: 20px; background: var(--panel-dark); color: var(--text-dark); border-radius: 12px; z-index: 10001; }
    `);

    // ---------- UI Skeleton ----------
    function generateStacksHTML() {
        return `
      <div id="stacks">
        <h3>Quick Stacks</h3>
        ${state.stacks.map(tag => `
          <label><input type="checkbox" class="stack-filter" value="${escapeHtml(tag)}"> ${prettyTag(tag)}</label>
        `).join('')}
      </div>
    `;
    }

    const mainLayoutHTML = `
    <div id="loading-indicator">Loading Applications...</div>
    <div id="pro-control-app-container" style="display: none;">
      <header id="app-header">
        <div id="sticky-header-content">
            <div id="header-top-row">
                <div id="header-title-wrap">
                    <img id="header-logo" src="https://raw.githubusercontent.com/SysAdminDoc/NoNinite/refs/heads/main/assets/icons/favicon.ico" alt="NoNinite Logo">
                    <div>
                        <span id="app-title">NoNinite</span>
                        <span id="app-subtitle">No Ninite installers, use these instead.</span>
                    </div>
                </div>
                <div id="header-controls">
                    <button id="theme-toggle-btn" class="control-btn" title="Toggle Theme">
                        <svg id="theme-icon-sun" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        <svg id="theme-icon-moon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    </button>
                    <button id="settings-btn" class="control-btn" title="Settings">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-settings" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"></path><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path></svg>
                    </button>
                </div>
            </div>
            <div id="selection-info-bar">
                 <div id="selection-chips"></div>
                 <button id="clear-all-btn" class="secondary-btn btn clear-btn hidden" title="Clear all selections">Clear All</button>
            </div>
            <div id="toolbar">
                <div id="search-wrap">
                    <input id="global-search" type="text" placeholder="Search apps (/, ↑/↓ to navigate, Enter to select)" autocomplete="off" />
                    <span id="search-hint">/</span>
                </div>
                <div class="toolbar-row" style="justify-content: flex-start; gap: 12px;">
                    <select id="preset-select" class="secondary-btn btn">
                        <option value="">Apply preset...</option>
                    </select>
                    <button id="get-script-btn" class="primary-btn btn exciting-btn" disabled>Generate Script</button>
                </div>
            </div>
        </div>
      </header>
      <div id="main-content">
        ${state.options.enableStacks ? `<div id="left-rail">${generateStacksHTML()}</div>` : `<div id="left-rail" class="hidden"></div>`}
        <div id="main-rail">
          <div>
            <ul class="list-unstyled center-block js-masonry"></ul>
          </div>
        </div>
      </div>
    </div>
  `;

    const panelAndModalsHTML = `
    <div id="app-tooltip" style="display:none;"></div>
    <div class="modal-overlay settings-modal-overlay" style="display:none;opacity:0;">
      <div class="modal settings-modal">
        <div class="modal-header">
          <h2>Settings</h2>
        </div>
        <button id="close-settings-modal-btn" class="control-btn modal-close-btn" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div class="modal-body settings-modal-body">
          <div class="settings-group" id="generator-options">
            <h3>Script Generation</h3>
            <label>Winget Scope:
              <select id="winget-scope" class="secondary-btn btn"><option value="machine">machine</option><option value="user">user</option></select>
            </label>
            <label><input type="checkbox" id="opt-winget-silent"> winget: --silent</label>
            <label><input type="checkbox" id="opt-winget-disable-interactivity"> winget: --disable-interactivity</label>
            <label><input type="checkbox" id="opt-winget-accept"> winget: accept agreements</label>
            <label><input type="checkbox" id="opt-choco-noninteractive"> choco: -y</label>
            <label><input type="checkbox" id="opt-choco-noprogress"> choco: --no-progress</label>
            <label><input type="checkbox" id="opt-bootstrap"> Generate PowerShell bootstrap</label>
          </div>
           <div class="settings-group" id="ui-options">
            <h3>Interface</h3>
            <label><input type="checkbox" id="opt-enable-winget"> Enable Winget</label>
            <label><input type="checkbox" id="opt-enable-choco"> Enable Chocolatey</label>
            <small>At least one package manager must be enabled.</small>
            <hr style="border-color: var(--border-dark); margin: 0; width: 100%;">
            <label><input type="checkbox" id="opt-enable-stacks"> Enable Quick Stacks sidebar</label>
            <label><input type="checkbox" id="opt-edit-mode"> Edit mode (inline app list delete)</label>
          </div>
          <div class="settings-group" id="presets-manager">
            <h3>Presets</h3>
            <div class="toolbar-row"><input id="preset-name" class="secondary-btn btn" placeholder="Preset name" style="flex:1;"></div>
            <textarea id="preset-items" class="secondary-btn btn" placeholder="Items (comma-separated app names)" style="min-height: 80px;"></textarea>
            <div class="toolbar-row"><button id="add-preset-btn" class="primary-btn btn">Add/Update</button></div>
            <select id="preset-list" size="6" class="secondary-btn btn"></select>
            <div class="toolbar-row">
              <button id="delete-preset-btn" class="secondary-btn btn">Delete</button>
              <button id="export-presets-btn" class="secondary-btn btn">Export</button>
              <button id="import-presets-btn" class="secondary-btn btn">Import</button>
            </div>
          </div>
          <div class="settings-group" id="config-io">
            <h3>Configuration</h3>
            <div class="toolbar-row">
              <button id="export-config-btn" class="primary-btn btn">Export All</button>
              <button id="import-config-btn" class="secondary-btn btn">Import All</button>
              <button id="reset-config-btn" class="secondary-btn btn" style="border-color: var(--danger); color: var(--danger)!important;">Reset All</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-overlay script-modal-overlay" style="display:none;opacity:0;">
      <div class="modal script-modal">
        <div class="modal-header">
          <h2 id="script-modal-title">Generated Script</h2>
        </div>
        <button id="close-script-modal-btn" class="control-btn modal-close-btn" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div class="script-modal-body">
          <div class="script-output-wrap">
            <h3>
                <span>PowerShell Bootstrap</span>
                <button id="download-ps-btn" class="secondary-btn btn" title="Download as .ps1 file">Download</button>
            </h3>
            <textarea id="ps-bootstrap-output" readonly></textarea>
          </div>
          <div class="script-output-wrap">
            <h3>
                <span>Plain Commands</span>
                <button id="download-plain-btn" class="secondary-btn btn" title="Download as .ps1 file">Download</button>
            </h3>
            <textarea id="plain-commands-output" readonly></textarea>
          </div>
        </div>
        <div class="script-modal-footer">
          <div>
            <button id="copy-ps-btn" class="primary-btn btn">Copy Bootstrap</button>
            <button id="copy-plain-btn" class="secondary-btn btn">Copy Plain</button>
          </div>
          <button id="copy-script-btn" class="primary-btn btn">Copy Both</button>
        </div>
      </div>
    </div>
  `;

    // ---------- Build UI ----------
    function buildUI() {
        $('body > *').not('script').hide();
        $('body').prepend(mainLayoutHTML).append(panelAndModalsHTML);
    }

    // ---------- Theme ----------
    function applyTheme() {
        $('body').removeClass('dark-theme light-theme').addClass(state.theme + '-theme');
        $('#theme-icon-sun').toggle(state.theme === 'light');
        $('#theme-icon-moon').toggle(state.theme === 'dark');
    }

    // ---------- App Grid / Search / Stacks ----------
    let fuse;
    function buildFuseIndex() {
        const items = [];
        Object.entries(state.appData).forEach(([cat, apps]) => {
            apps.forEach(app => items.push({ category: cat, name: app.name, wingetId: app.wingetId || '', chocoId: app.chocoId || '', description: app.description, link: app.link }));
        });
        fuse = new Fuse(items, { keys: ['name', 'wingetId', 'chocoId', 'category'], threshold: 0.35, includeScore: true });
    }

    function appHasAnySelectedStack(appName) {
        const checked = $('.stack-filter:checked').map((_, el) => $(el).val()).get();
        if (checked.length === 0) return true; // no stack filters means show all
        const tags = state.appTags[appName] || [];
        return tags.some(t => checked.includes(t));
    }

    function getFaviconUrl(link, source = 'duckduckgo') {
        if (!link || link === '#') return '';
        let hostname;
        try {
            hostname = new URL(link).hostname;
        } catch (e) {
            const domainMatch = link.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/);
            hostname = (domainMatch && domainMatch[1]) ? domainMatch[1] : null;
        }
        if (!hostname) return '';

        switch(source) {
            case 'google':
                return `https://www.google.com/s2/favicons?sz=32&domain_url=${hostname}`;
            case 'google_s2':
                 return `https://s2.googleusercontent.com/s2/favicons?domain=${hostname}`;
            case 'duckduckgo':
            default:
                return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
        }
    }

    function attachFaviconErrorHandlers() {
        $('.app-favicon:not(.error-handler-attached)').each(function() {
            const $img = $(this);
            $img.addClass('error-handler-attached');
            $img.on('error', function() {
                const sources = JSON.parse($img.attr('data-sources') || '[]');
                if (sources.length > 0) {
                    const nextSrc = sources.shift();
                    $img.attr('data-sources', JSON.stringify(sources));
                    $img.attr('src', nextSrc);
                } else {
                    $img.off('error');
                    $img.hide();
                }
            });
        });
    }

    function populateAppGrid() {
        const $container = $('.js-masonry');
        if (!$container.length) return;
        $container.empty();

        const showWinget = !!state.options.enableWinget;
        const showChoco = !!state.options.enableChoco;
        const singleManagerMode = showWinget !== showChoco;

        Object.entries(state.appData).forEach(([categoryName, apps]) => {
            let appItemsHTML = '';
            apps.forEach(app => {
                if (!appHasAnySelectedStack(app.name)) return;

                const wingetAvailable = showWinget && app.wingetId;
                const chocoAvailable = showChoco && app.chocoId;
                if (!wingetAvailable && !chocoAvailable) return;

                let optionsHTML = '';
                if (singleManagerMode) {
                    const type = wingetAvailable ? 'winget' : 'choco';
                    const id = wingetAvailable ? app.wingetId : app.chocoId;
                    optionsHTML = `<div class="install-options hidden"><label><input type="checkbox" class="app-checkbox" data-app="${escapeHtml(app.name)}" data-type="${type}" value="${escapeHtml(id)}"></label></div>`;
                } else {
                    const wingetOption = wingetAvailable ? `<label><input type="checkbox" class="app-checkbox" data-app="${escapeHtml(app.name)}" data-type="winget" value="${escapeHtml(app.wingetId)}"> Winget</label>` : '';
                    const chocoOption = chocoAvailable ? `<label><input type="checkbox" class="app-checkbox" data-app="${escapeHtml(app.name)}" data-type="choco" value="${escapeHtml(app.chocoId)}"> Choco</label>` : '';
                    optionsHTML = `<div class="install-options">${wingetOption} ${chocoOption}</div>`;
                }

                let faviconHTML;
                if (faviconOverrides[app.name]) {
                    faviconHTML = `<img src="${faviconOverrides[app.name]}" class="app-favicon" alt="">`;
                } else {
                    const faviconSources = [
                        getFaviconUrl(app.link, 'duckduckgo'),
                        getFaviconUrl(app.link, 'google'),
                        getFaviconUrl(app.link, 'google_s2')
                    ].filter(Boolean);
                    const primaryFavicon = faviconSources.shift() || '';
                    const sourcesAttr = `data-sources='${JSON.stringify(faviconSources)}'`;
                    faviconHTML = `<img src="${primaryFavicon}" class="app-favicon" alt="" ${sourcesAttr}>`;
                }


                appItemsHTML += `
                <li data-app-name="${escapeHtml(app.name)}">
                    <div class="app-item-label">
                        <div class="app-left">
                            ${faviconHTML}
                            <span class="app-name" data-app="${escapeHtml(app.name)}">${escapeHtml(app.name)}</span>
                        </div>
                        ${optionsHTML}
                    </div>
                     <span class="app-delete" data-cat="${escapeHtml(categoryName)}" data-app="${escapeHtml(app.name)}" title="Remove app">×</span>
                </li>`;
            });

            if (!appItemsHTML.trim()) return;
            const isCollapsed = !!state.collapsedCategories[categoryName];
            $container.append(`
                <li class="homepage-app-section" data-category="${escapeHtml(categoryName)}">
                <div class="category-header ${isCollapsed ? 'collapsed' : ''}">
                    <div class="category-title-wrap"><h4>${escapeHtml(categoryName)}</h4></div>
                    <span class="toggle-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
                </div>
                <ul class="app-list ${isCollapsed ? 'collapsed' : ''}">${appItemsHTML}</ul>
                </li>`);
        });

        toggleEditModeUI(state.editMode);
        updateSelectionsFromState();
        attachFaviconErrorHandlers();
        const $m = $('.js-masonry');
        if ($m.data('masonry')) $m.masonry('reloadItems').masonry('layout');
        else $m.masonry({ itemSelector: '.homepage-app-section', fitWidth: true, transitionDuration: '0.3s' });
    }

    function updateSelectionsFromState() {
        $('.app-item-label').removeClass('selected');
        $('.app-checkbox:checked').each(function() {
            $(this).closest('.app-item-label').addClass('selected');
        });
    }

    function toggleEditModeUI(on) {
        $('.app-delete').css('display', on ? 'inline-block' : 'none');
    }

    // ---------- Selection / chips ----------
    function getSelections() {
        const wingetApps = $('.app-checkbox[data-type="winget"]:checked').map((_, el) => $(el).val()).get();
        const chocoApps = $('.app-checkbox[data-type="choco"]:checked').map((_, el) => $(el).val()).get();
        const byApp = {};
        $('.app-checkbox:checked').each((_, el) => {
            const $el = $(el);
            const app = $el.data('app');
            const type = $el.data('type');
            const id = $el.val();
            if (!byApp[app]) byApp[app] = {};
            byApp[app][type] = id;
        });
        return { wingetApps, chocoApps, byApp };
    }

    function renderChips() {
        const { byApp } = getSelections();
        const $wrap = $('#selection-chips').empty();
        const selectionCount = Object.keys(byApp).length;

        $('#clear-all-btn').toggleClass('hidden', selectionCount === 0);

        Object.entries(byApp).forEach(([app, sources]) => {
            Object.entries(sources).forEach(([src, id]) => {
                const key = `${src}:${id}`;
                const ver = state.versions[key] ? `@${state.versions[key]}` : '';
                const chipHTML = `<div class="chip" title="Click to remove ${escapeHtml(app)}" data-type="${src}" data-id="${cssEscape(id)}">
                                    <span class="src">${src.toUpperCase()}</span> ${escapeHtml(app)}${escapeHtml(ver)}
                                  </div>`;
                $wrap.append(chipHTML);
            });
        });
    }

    function updateGetButton() {
        const { wingetApps, chocoApps } = getSelections();
        const $button = $('#get-script-btn');
        const selectionCount = wingetApps.length + chocoApps.length;
        if (selectionCount > 0) $button.text(`Generate Script (${selectionCount})`).prop('disabled', false);
        else $button.text('Generate Script').prop('disabled', true);
        renderChips();
        updateSelectionsFromState();
        updateURLHash();
    }

    function preferredSourceFor(app) {
        if (state.options.enableWinget && app.wingetId) return 'winget';
        if (state.options.enableChoco && app.chocoId) return 'choco';
        return null;
    }

    function appByName(name) {
        for (const cat in state.appData) {
            const app = state.appData[cat].find(a => a.name === name);
            if (app) return app;
        }
        return null;
    }

    // ---------- Search / keyboard ----------
    let kbIndex = -1, kbMatches = [];
    function clearHighlights() { $('.app-item-label').removeClass('kb-highlight'); }
    function highlightByName(name) {
        clearHighlights();
        const $el = $(`li[data-app-name="${cssEscape(name)}"]`).find('.app-item-label');
        if ($el.length) { $el.addClass('kb-highlight')[0].scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    }
    function toggleFocused() {
        const item = kbMatches[kbIndex];
        if (!item) return;
        $(`li[data-app-name="${cssEscape(item.name)}"]`).find('.app-item-label').trigger('click');
    }

    // ---------- URL share ----------
    function updateURLHash() {
        const { wingetApps, chocoApps } = getSelections();
        const params = new URLSearchParams();
        if (wingetApps.length) params.set('winget', wingetApps.join(','));
        if (chocoApps.length) params.set('choco', chocoApps.join(','));
        const h = params.toString();
        if (h) history.replaceState(null, '', `#${h}`);
        else history.replaceState(null, '', location.pathname + location.search);
    }
    function loadFromHash() {
        if (!location.hash) return;
        try {
            const sp = new URLSearchParams(location.hash.slice(1));
            const w = (sp.get('winget') || '').split(',').filter(Boolean);
            const c = (sp.get('choco') || '').split(',').filter(Boolean);
            w.forEach(id => $(`.app-checkbox[data-type="winget"][value="${cssEscape(id)}"]`).prop('checked', true));
            c.forEach(id => $(`.app-checkbox[data-type="choco"][value="${cssEscape(id)}"]`).prop('checked', true));
        } catch (e) {
            console.error("Failed to parse URL hash:", e);
            history.replaceState(null, '', location.pathname + location.search);
        }
    }
    function deduplicateSelectionsFromURL() {
        const { byApp } = getSelections();
        for (const appName in byApp) {
            const sources = byApp[appName];
            if (sources.winget && sources.choco) {
                const app = appByName(appName);
                const preferred = preferredSourceFor(app);
                if (preferred === 'winget') {
                    $(`.app-checkbox[data-app="${cssEscape(appName)}"][data-type="choco"]`).prop('checked', false);
                } else if (preferred === 'choco') {
                     $(`.app-checkbox[data-app="${cssEscape(appName)}"][data-type="winget"]`).prop('checked', false);
                }
            }
        }
    }

    // ---------- Script generation ----------
    function buildPlainCommands({ wingetApps, chocoApps }) {
        let finalChocoApps = state.options.enableChoco ? chocoApps : [];
        const wopts = [];
        if (state.options.wingetAccept) wopts.push('--accept-package-agreements', '--accept-source-agreements');
        if (state.options.wingetSilent) wopts.push('--silent');
        if (state.options.wingetDisableInteractivity) wopts.push('--disable-interactivity');
        if (state.options.wingetScope) wopts.push(`--scope ${state.options.wingetScope}`);
        const wingetParts = wingetApps.map(id => `--id "${id}"`);
        const chocoOpts = [];
        if (state.options.chocoY) chocoOpts.push('-y');
        if (state.options.chocoNoProgress) chocoOpts.push('--no-progress');
        let plain = '';
        if (wingetParts.length && state.options.enableWinget) plain += `# Winget Install\nwinget install ${wopts.join(' ')} ${wingetParts.join(' ')}\n\n`;
        if (finalChocoApps.length && state.options.enableChoco) plain += `# Chocolatey Install\nchoco install ${finalChocoApps.join(' ')} ${chocoOpts.join(' ')}\n`;
        return plain.trim();
    }

    function buildBootstrapPS({ wingetApps, chocoApps }) {
        const plain = buildPlainCommands({ wingetApps, chocoApps });
        const lines = [
            `# Requires: PowerShell 5.1+, Internet connectivity`,
            `# Elevate if not admin`,
            `if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {`,
            `  Start-Process PowerShell -Verb RunAs "-NoProfile -ExecutionPolicy Bypass -Command \`"& {Start-Transcript -Path .\\noninite-install.log -Append; & '$PSCommandPath'}\`"";`,
            `  exit;`,
            `}`,
            ``,
            `# Check for Winget`,
            `if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {`,
            `    Write-Host "Winget not found. Attempting to install from Microsoft Store..." -ForegroundColor Yellow`,
            `    try {`,
            `        Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe`,
            `        Write-Host "Winget (App Installer) registration attempted. Please re-run the script if installs fail." -ForegroundColor Green`,
            `    } catch {`,
            `        Write-Host "Failed to automatically register Winget. Please install 'App Installer' from the Microsoft Store." -ForegroundColor Red`,
            `        exit;`,
            `    }`,
            `}`,
            ``,
            `# Ensure Chocolatey (optional)`,
            `function Ensure-Chocolatey {`,
            `  if (Get-Command choco -ErrorAction SilentlyContinue) { return }`,
            `  Write-Host "Installing Chocolatey..." -ForegroundColor Cyan`,
            `  Set-ExecutionPolicy Bypass -Scope Process -Force;`,
            `  [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12;`,
            `  Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))`,
            `}`,
            ``,
            `$needChoco = ${(state.options.enableChoco && chocoApps.length > 0) ? '$true' : '$false'}`,
            `if ($needChoco) { Ensure-Chocolatey }`,
            ``,
            `# Run installs`,
            `Write-Host "Starting installs..." -ForegroundColor Green`,
            `${plain}`,
            ``,
            `Write-Host "Done." -ForegroundColor Green`
        ];
        return lines.join('\n');
    }

    function generateAndShowScript() {
        const { wingetApps, chocoApps } = getSelections();
        const plain = buildPlainCommands({ wingetApps, chocoApps });
        const ps = state.options.bootstrap ? buildBootstrapPS({ wingetApps, chocoApps }) : plain;
        $('#plain-commands-output').val(plain);
        $('#ps-bootstrap-output').val(ps);
        openOverlay('.script-modal-overlay', '.script-modal');
    }

    // ---------- Presets, Config, Overlays, etc. ----------
    function applyPreset(presetName) {
        const p = state.presets.find(x => x.name === presetName);
        if (!p) return;
        $('.app-checkbox').prop('checked', false);
        (p.items || []).forEach(itemName => {
            const app = appByName(itemName);
            if (!app) return;
            const src = preferredSourceFor(app);
            if (!src) return;
            const val = src === 'winget' ? app.wingetId : app.chocoId;
            $(`.app-checkbox[data-type="${src}"][value="${cssEscape(val)}"]`).prop('checked', true);
        });
        updateGetButton();
    }
    function refreshPresetSelects() {
        const $sel = $('#preset-select').empty().append(`<option value="">Apply preset...</option>`);
        state.presets.forEach(p => $sel.append(`<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`));
        const $list = $('#preset-list').empty();
        state.presets.forEach(p => $list.append(`<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`));
    }
    function exportConfig() {
        const json = JSON.stringify(state, null, 2);
        GM_setClipboard(json, 'text');
        alert('Configuration copied to clipboard!');
    }
    function importConfigFromPrompt() {
        const val = window.prompt('Paste exported JSON config here:');
        if (!val) return;
        try {
            const obj = JSON.parse(val);
            Object.assign(state, obj);
            saveState();
            location.reload();
        } catch { alert('Invalid JSON.'); }
    }
    function openOverlay(overlaySel, modalSel) {
        const $ov = $(overlaySel), $md = $(modalSel);
        $ov.css('display', 'flex'); setTimeout(() => { $ov.css('opacity', 1); $md.css('transform', 'scale(1)'); }, 10);
    }
    function closeOverlay(overlaySel, modalSel) {
        const $ov = $(overlaySel), $md = $(modalSel);
        $ov.css('opacity', 0); $md.css('transform', 'scale(0.95)'); setTimeout(() => $ov.css('display', 'none'), 300);
    }

    // ---------- Utils ----------
    function setFavicon(url) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = url;
    }
    function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
    function cssEscape(s) { return String(s).replace(/([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g, '\\$1'); }
    function prettyTag(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
    function rebuildStacksSidebar() {
        if (!state.options.enableStacks) $('#left-rail').addClass('hidden').empty();
        else $('#left-rail').removeClass('hidden').html(generateStacksHTML());
        $('.stack-filter').on('change', () => { populateAppGrid(); updateGetButton(); });
    }
    function downloadToFile(content, filename, contentType) {
        const a = document.createElement('a');
        const file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }

    // ---------- Init ----------
    window.addEventListener('DOMContentLoaded', async function () {
        buildUI();
        document.title = 'NoNinite';
        setFavicon('https://raw.githubusercontent.com/SysAdminDoc/NoNinite/refs/heads/main/assets/icons/favicon.ico');
        applyTheme();

        try {
            const apps = await fetchAndProcessApps();
            state.appData = apps;
            $('#loading-indicator').hide();
            $('#pro-control-app-container').show();
        } catch (error) {
            $('#loading-indicator').text(error).css('color', 'red');
             if (Object.keys(state.appData).length > 0) {
                 $('#loading-indicator').hide();
                 $('#pro-control-app-container').show();
                 alert("Could not fetch the latest app list. Using the last saved version.");
             } else return;
        } finally {
             $('body').css('visibility', 'visible');
        }

        populateAppGrid();
        buildFuseIndex();
        loadFromHash();
        deduplicateSelectionsFromURL();
        updateGetButton();
        refreshPresetSelects();

        // --- Event Listeners ---

        // Tooltip logic
        let tooltipTimer;
        const $tooltip = $('#app-tooltip');

        $(document).on('mouseenter', '.app-item-label', function() {
            const $label = $(this);
            clearTimeout(tooltipTimer);

            const appName = $label.closest('li').data('app-name');
            const app = appByName(appName);
            if (!app) return;

            const faviconSrc = $label.find('.app-favicon').attr('src');
            const linkHTML = app.link && app.link !== '#' ? `<a id="app-tooltip-link" href="${escapeHtml(app.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(app.link)}</a>` : 'No URL provided';

            $tooltip.html(`
                <div id="app-tooltip-header">
                    <img id="app-tooltip-favicon" src="${escapeHtml(faviconSrc)}" alt="">
                    <strong id="app-tooltip-name">${escapeHtml(app.name)}</strong>
                </div>
                <p id="app-tooltip-desc">${escapeHtml(app.description || 'No description available.')}</p>
                ${linkHTML}
            `);

            const labelRect = $label[0].getBoundingClientRect();
            $tooltip.css({
                top: `${labelRect.top + window.scrollY - 20}px`,
                left: `${labelRect.right + window.scrollX - 20}px`,
                display: 'block',
                opacity: 0
            }).animate({ opacity: 1 }, 150);

        }).on('mouseleave', '.app-item-label', function() {
            tooltipTimer = setTimeout(() => {
                $tooltip.stop().animate({ opacity: 0 }, 150, () => $tooltip.hide());
            }, 300);
        });

        $tooltip.on('mouseenter', function() {
            clearTimeout(tooltipTimer);
        }).on('mouseleave', function() {
            tooltipTimer = setTimeout(() => {
                $tooltip.stop().animate({ opacity: 0 }, 150, () => $tooltip.hide());
            }, 300);
        });


        $('#theme-toggle-btn').on('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyTheme(); saveState(); });
        $('#settings-btn').on('click', () => openOverlay('.settings-modal-overlay', '.settings-modal'));
        $('#close-settings-modal-btn').on('click', () => closeOverlay('.settings-modal-overlay', '.settings-modal'));
        $('.settings-modal-overlay').on('click', function(e) { if ($(e.target).is('.settings-modal-overlay')) closeOverlay('.settings-modal-overlay', '.settings-modal'); });

        $('#get-script-btn').on('click', generateAndShowScript);
        $('#close-script-modal-btn').on('click', () => closeOverlay('.script-modal-overlay', '.script-modal'));
        $('.script-modal-overlay').on('click', function(e) { if ($(e.target).is('.script-modal-overlay')) closeOverlay('.script-modal-overlay', '.script-modal'); });

        $('#download-ps-btn').on('click', function() {
            const content = $('#ps-bootstrap-output').val();
            downloadToFile(content, 'NoNinite-Bootstrap.ps1', 'application/octet-stream');
        });
        $('#download-plain-btn').on('click', function() {
            const content = $('#plain-commands-output').val();
            downloadToFile(content, 'NoNinite-Commands.ps1', 'application/octet-stream');
        });

        $('#copy-ps-btn, #copy-plain-btn, #copy-script-btn').on('click', function() {
            const btnId = $(this).attr('id');
            let textToCopy = '';
            if (btnId === 'copy-ps-btn') textToCopy = $('#ps-bootstrap-output').val();
            else if (btnId === 'copy-plain-btn') textToCopy = $('#plain-commands-output').val();
            else textToCopy = `# Bootstrap\n${$('#ps-bootstrap-output').val()}\n\n# Plain\n${$('#plain-commands-output').val()}`;
            GM_setClipboard(textToCopy, 'text');
            const originalText = $(this).text();
            $(this).text('Copied!');
            setTimeout(() => $(this).text(originalText), 1500);
        });

        $('#preset-select').on('change', function () {
            const name = $(this).val();
            if (name) applyPreset(name);
            $(this).val('');
        });

        $('#winget-scope').val(state.options.wingetScope);
        ['wingetSilent', 'wingetDisableInteractivity', 'wingetAccept', 'chocoY', 'chocoNoProgress', 'bootstrap', 'enableWinget', 'enableChoco', 'enableStacks', 'editMode'].forEach(opt => {
            const kebabCase = opt.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            $(`#opt-${kebabCase}`).prop('checked', state.options[opt] !== undefined ? state.options[opt] : state[opt]);
        });

        $('#generator-options, #ui-options').on('change', 'input, select', function () {
            const isDisablingWinget = $(this).attr('id') === 'opt-enable-winget' && !this.checked;
            const isDisablingChoco = $(this).attr('id') === 'opt-enable-choco' && !this.checked;

            if (isDisablingWinget && !$('#opt-enable-choco').is(':checked')) {
                alert('At least one package manager (Winget/Choco) must be enabled.');
                $(this).prop('checked', true);
                return;
            }
            if (isDisablingChoco && !$('#opt-enable-winget').is(':checked')) {
                alert('At least one package manager (Winget/Choco) must be enabled.');
                $(this).prop('checked', true);
                return;
            }

            state.options.wingetScope = $('#winget-scope').val();
            state.options.wingetSilent = $('#opt-winget-silent').is(':checked');
            state.options.wingetDisableInteractivity = $('#opt-winget-disable-interactivity').is(':checked');
            state.options.wingetAccept = $('#opt-winget-accept').is(':checked');
            state.options.chocoY = $('#opt-choco-noninteractive').is(':checked');
            state.options.chocoNoProgress = $('#opt-choco-noprogress').is(':checked');
            state.options.bootstrap = $('#opt-bootstrap').is(':checked');
            state.options.enableWinget = $('#opt-enable-winget').is(':checked');
            state.options.enableChoco = $('#opt-enable-choco').is(':checked');
            state.options.enableStacks = $('#opt-enable-stacks').is(':checked');
            state.editMode = $('#opt-edit-mode').is(':checked');

            saveState();
            toggleEditModeUI(state.editMode);
            rebuildStacksSidebar();
            populateAppGrid();
            updateGetButton();
        });

        $(document).on('change', '.stack-filter', populateAppGrid);
        $('#preset-list').on('change', function() {
            const preset = state.presets.find(p => p.name === $(this).val());
            if (preset) {
                $('#preset-name').val(preset.name);
                $('#preset-items').val((preset.items || []).join(', '));
            }
        });
        $('#add-preset-btn').on('click', () => {
            const name = $('#preset-name').val().trim();
            if (!name) return alert('Preset name required.');
            const items = $('#preset-items').val().split(',').map(s => s.trim()).filter(Boolean);
            const idx = state.presets.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
            if (idx >= 0) state.presets[idx].items = items;
            else state.presets.push({ name, items });
            saveState(); refreshPresetSelects();
            $('#preset-name, #preset-items').val('');
        });
        $('#delete-preset-btn').on('click', () => {
            const sel = $('#preset-list').val(); if (!sel) return;
            state.presets = state.presets.filter(p => p.name !== sel);
            saveState(); refreshPresetSelects(); $('#preset-name, #preset-items').val('');
        });
        $('#export-presets-btn').on('click', () => { GM_setClipboard(JSON.stringify(state.presets, null, 2), 'text'); alert('Presets copied.'); });
        $('#import-presets-btn').on('click', () => {
             const val = window.prompt('Paste Presets JSON:'); if (!val) return;
             try { const arr = JSON.parse(val); if (Array.isArray(arr)) { state.presets = arr; saveState(); refreshPresetSelects(); alert('Presets imported.'); } else alert('Invalid format.'); } catch { alert('Invalid JSON.'); }
        });

        $('#clear-all-btn').on('click', () => {
            $('.app-checkbox:checked').prop('checked', false).trigger('change');
        });

        $(document).on('click', '.chip', function() {
            const type = $(this).data('type');
            const id = $(this).data('id');
            $(`.app-checkbox[data-type="${type}"][value="${id}"]`).prop('checked', false).trigger('change');
        });

        $(document).on('click', '.category-header', function () {
            const categoryName = $(this).closest('.homepage-app-section').data('category');
            state.collapsedCategories[categoryName] = !state.collapsedCategories[categoryName];
            $(this).toggleClass('collapsed').siblings('.app-list').toggleClass('collapsed');
            saveState();
            setTimeout(() => $('.js-masonry').masonry('layout'), 350);
        });

        $(document).on('change', '.app-checkbox', updateGetButton);
        $(document).on('click', '.app-item-label', function(e) {
            if ($(e.target).is('input') || $(e.target).closest('label').length) {
                return;
            }
            e.preventDefault();

            const singleManagerMode = state.options.enableWinget !== state.options.enableChoco;

            if (singleManagerMode) {
                const $checkbox = $(this).find('.app-checkbox');
                $checkbox.prop('checked', !$checkbox.prop('checked')).trigger('change');
            } else {
                const appName = $(this).closest('li').data('app-name');
                const app = appByName(appName);
                if (!app) return;
                const preferredSrc = preferredSourceFor(app);
                if (!preferredSrc) return;
                const $preferredCheckbox = $(this).find(`.app-checkbox[data-type="${preferredSrc}"]`);
                if ($preferredCheckbox.length === 0) return;

                const wasChecked = $preferredCheckbox.prop('checked');
                $(this).find('.app-checkbox').prop('checked', false);
                $preferredCheckbox.prop('checked', !wasChecked);
                $(this).find('.app-checkbox').first().trigger('change');
            }
        });


        $(document).on('keydown', (e) => {
            const $input = $('#global-search');
            if (e.key === '/' && document.activeElement !== $input[0]) {
                e.preventDefault(); $input.focus().select();
            } else if (document.activeElement === $input[0]) {
                if (kbMatches.length === 0) return;
                if (e.key === 'ArrowDown') { e.preventDefault(); kbIndex = (kbIndex + 1) % kbMatches.length; highlightByName(kbMatches[kbIndex].name); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); kbIndex = (kbIndex - 1 + kbMatches.length) % kbMatches.length; highlightByName(kbMatches[kbIndex].name); }
                else if (e.key === 'Enter') { e.preventDefault(); toggleFocused(); }
                else if (e.key === 'Escape') { $input.val('').trigger('input'); }
            }
        });

        function doSearch(query) {
            const $sections = $('.homepage-app-section');
            kbIndex = -1;
            kbMatches = [];
            clearHighlights();

            if (!query) {
                $sections.show();
                $sections.find('li[data-app-name]').show();
                $('.js-masonry').masonry('layout');
                return;
            }

            const results = fuse.search(query);
            const visibleApps = new Set(results.map(r => r.item.name));
            kbMatches = results.map(r => r.item);

            $sections.each(function() {
                let hasVisibleApp = false;
                $(this).find('li[data-app-name]').each(function() {
                    const appName = $(this).data('app-name');
                    if (visibleApps.has(appName)) {
                        $(this).show();
                        hasVisibleApp = true;
                    } else {
                        $(this).hide();
                    }
                });
                if (hasVisibleApp) $(this).show();
                else $(this).hide();
            });

            if (kbMatches.length > 0) {
                kbIndex = 0;
                highlightByName(kbMatches[0].name);
            }

            $('.js-masonry').masonry('layout');
        }


        $(document).on('input', '#global-search', function () { doSearch(this.value.trim()); });
        $('#export-config-btn').on('click', exportConfig);
        $('#import-config-btn').on('click', importConfigFromPrompt);
        $('#reset-config-btn').on('click', async function () {
            if (!confirm('This will delete ALL your custom presets, settings, and the cached app list. Are you sure?')) return;
            const keys = await GM_listValues();
            for (const key of keys) GM_deleteValue(key);
            alert('Configuration has been reset. The page will now reload.');
            location.reload();
        });
    });
})();
