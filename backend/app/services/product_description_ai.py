import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.core.config import settings


OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"


def create_fallback_product_description(name: str, category_name: str | None = None, subcategory_name: str | None = None) -> str:
    clean_name = " ".join(name.strip().split())
    if not clean_name:
        return ""

    labels = [label for label in [subcategory_name, category_name] if isinstance(label, str) and label.strip()]
    if labels:
        focus = labels[0].strip()
        return f"{clean_name} com apelo comercial para {focus.lower()}, ideal para vitrine e venda rapida."

    return f"{clean_name} com visual atrativo, boa apresentacao na vitrine e destaque para venda imediata."


def generate_product_description(name: str, category_name: str | None = None, subcategory_name: str | None = None) -> str:
    fallback = create_fallback_product_description(name, category_name, subcategory_name)
    if not fallback:
        return ""

    if not settings.openai_api_key:
        return fallback

    system_prompt = (
        "Voce escreve descricoes comerciais curtas para ecommerce em portugues do Brasil. "
        "Retorne apenas uma frase curta, natural e convincente, com no maximo 22 palavras. "
        "Nao invente especificacoes tecnicas, medidas, materiais, marcas, voltagem, capacidade ou beneficios nao informados. "
        "Baseie-se apenas no nome do produto e no contexto de categoria/subcategoria. "
        "Nao use aspas, emojis, markdown ou lista."
    )

    context_parts = [f"Nome do produto: {name.strip()}"]
    if category_name:
        context_parts.append(f"Categoria: {category_name.strip()}")
    if subcategory_name:
        context_parts.append(f"Subcategoria: {subcategory_name.strip()}")
    context_parts.append("Objetivo: gerar uma descricao comercial curta para vitrine da loja.")

    payload = {
        "model": settings.openai_model,
        "input": [
            {
                "role": "system",
                "content": [{"type": "input_text", "text": system_prompt}],
            },
            {
                "role": "user",
                "content": [{"type": "input_text", "text": "\n".join(context_parts)}],
            },
        ],
        "max_output_tokens": 120,
    }

    request = Request(
        OPENAI_RESPONSES_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=25) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, OSError):
        return fallback
    except json.JSONDecodeError:
        return fallback

    text = extract_response_text(data)
    if not text:
        return fallback

    normalized = " ".join(str(text).replace("\n", " ").split()).strip(" \"'")
    return normalized or fallback


def extract_response_text(data: dict) -> str:
    output_text = data.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text.strip()

    for item in data.get("output", []):
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            if content.get("type") == "output_text" and isinstance(content.get("text"), str) and content["text"].strip():
                return content["text"].strip()

    return ""
