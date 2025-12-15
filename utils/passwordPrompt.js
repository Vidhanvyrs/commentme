export function promptPassword(promptText = "Password: ") {
    return new Promise(resolve => {
      const stdin = process.stdin;
      const stdout = process.stdout;
  
      stdout.write(promptText);
  
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding("utf8");
  
      let password = "";
  
      function onData(char) {
        // ENTER / RETURN
        if (char === "\n" || char === "\r") {
          stdout.write("\n");
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          resolve(password);
          return;
        }
  
        // CTRL + C
        if (char === "\u0003") {
          stdout.write("\n");
          process.exit(1);
        }
  
        // BACKSPACE (Linux/macOS)
        if (char === "\u007F") {
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write("\b \b");
          }
          return;
        }
  
        // Ignore other control characters
        if (char < " ") return;
  
        // Normal character
        password += char;
        stdout.write("*");
      }
  
      stdin.on("data", onData);
    });
  }
  