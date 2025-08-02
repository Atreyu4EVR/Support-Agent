import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";
import { exec } from "child_process";

// Get the current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env
config({ path: resolve(__dirname, "../.env") });

const elevenlabs = new ElevenLabsClient();

const message =
  "Here's how you can apply to BYU-Idaho:\n\n1. **Start Your Application Online:**\nGo to www.byui.edu/apply. You'll need a Church account (non-members can create one).\n\n2. **Review Application Requirements:**\nCheck the requirements for your situation (first-year, transfer, international, etc.). No essays or application fee are required.\n\n3. **Submit Academic Records:**\n- U.S. students: Submit your high school transcripts.\n- International students: Have your academic documents evaluated by IERF or SpanTran.\n\n4. **English Proficiency (if applicable):**\nIf English is not your first language, submit TOEFL, IELTS (Academic), or PTE scores.\n\n5. **Complete and Submit the Application:**\nFill out all required sections and submit your application online.\n\n6. **After Acceptance:**\nPay the required deposit and follow the instructions for registration and orientation.\n\n7. **International Students:**\nAfter acceptance, you'll receive an I-20 document for your F-1 visa application. Pay the SEVIS I-901 fee and schedule your U.S. Embassy appointment.\n\n**Deadlines:**\nCheck the Application Deadlines for your intended semester.\n\n**More Information:**\nVisit the BYU-Idaho Application Process page for detailed, step-by-step guidance.\n\nIf you have a specific situation (transfer, international, online), let me know and I can provide tailored instructions!";

async function main() {
  const audioStream = await elevenlabs.textToSpeech.stream(
    "yj30vwTGJxSHezdAGsv9",
    {
      text: message,
      modelId: "eleven_multilingual_v2",
    }
  );

  // Process the audio stream
  const chunks: Uint8Array[] = [];
  const reader = audioStream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      console.log(`Received chunk of ${value.length} bytes`);
    }

    const totalBytes = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    console.log(`Total audio data: ${totalBytes} bytes`);

    // Combine all chunks into a single buffer
    const audioBuffer = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Save audio to file
    const audioFilePath = resolve(__dirname, "output.mp3");
    writeFileSync(audioFilePath, audioBuffer);
    console.log(`Audio saved to: ${audioFilePath}`);

    // Play the audio (macOS)
    console.log("Playing audio...");
    exec(`afplay "${audioFilePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error playing audio: ${error}`);
        return;
      }
      console.log("Audio playback completed!");
    });
  } finally {
    reader.releaseLock();
  }
}

main();
