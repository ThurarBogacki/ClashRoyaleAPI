import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let tag = searchParams.get("tag");

  if (!tag) {
    return NextResponse.json({ error: "A Tag do jogador é obrigatória." }, { status: 400 });
  }

  // A API oficial exige que a tag tenha '#' e seja URL Encoded (%23)
  tag = tag.toUpperCase().trim();
  if (!tag.startsWith("#")) {
    tag = `#${tag}`;
  }

  const encodedTag = encodeURIComponent(tag);
  const token = process.env.CLASH_ROYALE_API_TOKEN;

  // Trava a requisição se você não tiver colocado sua chave no .env.local
  if (!token) {
    return NextResponse.json(
      { error: "Token da API do Clash Royale não encontrado no servidor (.env.local)." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`https://proxy.royaleapi.dev/v1/players/${encodedTag}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      // Revalida a cada 60 segundos (ajuste conforme a necessidade de tempo real)
      next: { revalidate: 60 },
    });

    const data = await res.json();

    if (!res.ok) {
      // Retorna o erro oficial da Supercell (ex: 403 de IP inválido, 404 de Tag não encontrada)
      return NextResponse.json(
        { error: data.message || data.reason || "Erro ao buscar jogador na API oficial." },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno no servidor ao conectar com a API." }, { status: 500 });
  }
}