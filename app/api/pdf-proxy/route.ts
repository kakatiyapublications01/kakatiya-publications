import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
      "Access-Control-Expose-Headers": "Accept-Ranges, Content-Encoding, Content-Length, Content-Range",
    },
  });
}

export async function HEAD(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get("url");

  if (!pdfUrl) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const response = await fetch(pdfUrl, { method: "HEAD" });
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
      "Access-Control-Expose-Headers": "Accept-Ranges, Content-Encoding, Content-Length, Content-Range",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    });

    const contentLength = response.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);
    headers.set("Content-Type", response.headers.get("content-type") || "application/pdf");

    return new NextResponse(null, { status: 200, headers });
  } catch (err) {
    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get("url");

  if (!pdfUrl) {
    return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
  }

  try {
    const rangeHeader = request.headers.get("range");
    const fetchHeaders: Record<string, string> = {
      Accept: "application/pdf,application/octet-stream,*/*",
    };
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const response = await fetch(pdfUrl, { headers: fetchHeaders });

    if (!response.ok && response.status !== 206) {
      console.error("[pdf-proxy] Remote fetch status:", response.status);
      return NextResponse.json(
        { error: `Remote server returned HTTP ${response.status}` },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    const responseHeaders = new Headers({
      "Content-Type": response.headers.get("content-type") || "application/pdf",
      "Content-Length": arrayBuffer.byteLength.toString(),
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Content-Type, Accept",
      "Access-Control-Expose-Headers": "Accept-Ranges, Content-Encoding, Content-Length, Content-Range",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    });

    const contentRange = response.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    return new NextResponse(arrayBuffer, {
      status: response.status === 206 ? 206 : 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("[pdf-proxy] Proxy fetch exception:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch PDF via proxy" },
      { status: 500 }
    );
  }
}
