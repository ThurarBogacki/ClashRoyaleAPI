import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let tag = searchParams.get("tag");

  if (!tag) {
    return NextResponse.json({ error: "A Tag do jogador é obrigatória." }, { status: 400 });
  }

  tag = tag.toUpperCase().trim();
  if (!tag.startsWith("#")) {
    tag = `#${tag}`;
  }

  const encodedTag = encodeURIComponent(tag);
  const token = process.env.CLASH_ROYALE_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "Token da API do Clash Royale não encontrado (.env.local)." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`https://api.clashroyale.com/v1/players/${encodedTag}/battlelog`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { revalidate: 60 }, // Cache de 60 segundos
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || data.reason || "Erro ao buscar histórico de batalhas." },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno no servidor ao conectar com a API." }, { status: 500 });
  }
}