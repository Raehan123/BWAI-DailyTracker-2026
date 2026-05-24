import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Ensure we initialize the client with correct headers and API key from process env
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { message, history, context } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Prepare systemic instruction based on dashboard context
    const systemInstruction = `Anda adalah "Sora", asisten cerdas virtual pribadi yang berada di dalam dashboard "Mindful Days" milik user. 
Tugas Anda adalah memandu, menyemangati, menganalisis, dan memberikan rekomendasi yang membumi, penuh motivasi positif (Zen style), terstruktur, dan praktis.

Gunakan data status user berikut untuk memberikan respon personal dan akurat:
- Jumlah Quest Aktif saat ini: ${context?.tasksCount || 0} quest.
- Daftar Quest Aktif: ${JSON.stringify(context?.activeTasks || [])}
- Saldo Keuangan saat ini: Rp ${(context?.balance || 0).toLocaleString("id-ID")}
- Total Pendapatan: Rp ${(context?.totalIncome || 0).toLocaleString("id-ID")}
- Total Pengeluaran: Rp ${(context?.totalExpense || 0).toLocaleString("id-ID")}
- Daftar Transaksi Terakhir: ${JSON.stringify(context?.recentTransactions || [])}
- Daftar Kebiasaan (Habits) dan Streaks: ${JSON.stringify(context?.habits || [])}

PANDUAN RESPONS:
1. Balaslah selalu dalam Bahasa Indonesia yang ramah, sopan, antusias, dan membangun.
2. Berikan tips keuangan hemat bila pengeluaran tinggi, atau apresiasi bila neraca positif.
3. Berikan saran quest baru yang konkret jika diminta untuk membantu produktivitas user.
4. Semangati streak kebiasaan (habit streak) user agar mereka tetap konsisten!
5. Gunakan format Markdown yang rapi (bold, bullet points/list, or italic) agar mudah dibaca di layar chat yang sempit.
6. Hindari jawaban yang terlalu panjang lebar, langsung ke poin praktis demi kenyamanan membaca.`;

    // Construct contents array with optional history
    const contents: any[] = [];

    // Add conversation history
    if (history && Array.isArray(history)) {
      history.forEach((chatItem: { role: string; text: string }) => {
        contents.push({
          role: chatItem.role === "user" ? "user" : "model",
          parts: [{ text: chatItem.text }],
        });
      });
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Query Google GenAI via SDK using gemini-3.5-flash as default model
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75,
      },
    });

    const replyText = response.text || "Mohon maaf, saya sedang kesulitan memproses pesan Anda.";

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error("Gemini API Error in chat route:", error);
    return NextResponse.json(
      { error: "Gagal menghubungkan ke asisten AI: " + (error.message || error) },
      { status: 500 }
    );
  }
}
