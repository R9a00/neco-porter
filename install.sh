#!/bin/bash
# Neco Porter インストールスクリプト

echo "🐱 Installing Neco Porter..."

# 1. グローバルインストール（npm link）
if command -v npm &> /dev/null; then
    echo "📦 Installing globally with npm..."
    npm link
    echo "✅ Installed! You can now use 'neco' command anywhere."
else
    echo "⚠️  npm not found. Using alternative installation..."
    
    # 2. 代替案：シンボリックリンク
    INSTALL_DIR="/usr/local/bin"
    if [ -w "$INSTALL_DIR" ]; then
        ln -sf "$(pwd)/neco" "$INSTALL_DIR/neco"
        echo "✅ Installed to $INSTALL_DIR/neco"
    else
        # 3. ユーザーローカルインストール
        mkdir -p "$HOME/.local/bin"
        ln -sf "$(pwd)/neco" "$HOME/.local/bin/neco"
        echo "✅ Installed to ~/.local/bin/neco"
        echo
        echo "⚠️  Add this to your ~/.bashrc or ~/.zshrc:"
        echo '    export PATH="$HOME/.local/bin:$PATH"'
    fi
fi

echo
echo "🎉 Installation complete!"
echo
echo "Usage:"
echo "  cd your-project"
echo "  neco .              # Auto-detect and start"
echo "  neco python app.py  # Run specific command"
echo "  neco status         # Check status"