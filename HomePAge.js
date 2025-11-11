document.addEventListener('DOMContentLoaded', () => {
    const terminalOutput = document.getElementById('terminal-output');
    const textLines = [
        "SideKick OS v1.0.1",
        "",
        "READY.",
        "",
        "SELECT AN APPLICATION TO BEGIN._"
    ];
    let charIndex = 0;
    let lineIndex = 0;
    const typingSpeed = 50; // Milliseconds per character
    const lineDelay = 500;  // Milliseconds between lines

    /**
     * Recursive function to simulate typing out the text character by character.
     */
    function typeText() {
        if (lineIndex < textLines.length) {
            const currentLine = textLines[lineIndex];

            if (charIndex < currentLine.length) {
                // If not at the end of the line, type the next character
                const currentText = terminalOutput.innerHTML.replace('_', ''); // Remove previous cursor
                terminalOutput.innerHTML = currentText + currentLine.charAt(charIndex) + '_';
                charIndex++;
                setTimeout(typeText, typingSpeed);
            } else {
                // End of the line reached, move to the next line
                terminalOutput.innerHTML = terminalOutput.innerHTML.replace('_', '') + '<br>'; // Newline
                lineIndex++;
                charIndex = 0;
                setTimeout(typeText, lineDelay);
            }
        }
    }

    // Start the typing animation
    typeText();

    // --- Optional: Add a simple log for button clicks ---
    const appButtons = document.querySelectorAll('.app-btn');
    appButtons.forEach(button => {
        button.addEventListener('click', () => {
            const appName = button.getAttribute('data-app').toUpperCase();
            
            // Log the action to the terminal, creating a new line
            const newLog = `\n> LAUNCHING ${appName}...`;
            
            // Remove the old blinking cursor and append the new log
            let currentText = terminalOutput.innerHTML.replace('_', '');
            currentText += newLog;
            
            // Re-add the cursor at the new position
            terminalOutput.innerHTML = currentText + '_';
            
            // Scroll to the bottom of the monitor if content overflows
            const monitor = document.querySelector('.monitor');
            monitor.scrollTop = monitor.scrollHeight;
        });
    });
});