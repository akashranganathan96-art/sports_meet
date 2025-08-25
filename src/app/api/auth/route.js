const { NextRequest, NextResponse } = require("next/server");
const { authenticateUser, generateToken } = require("@/lib/auth");

async function POST(request) {
  try {
    const { secretCode } = await request.json();

    if (!secretCode) {
      return NextResponse.json(
        { error: "Secret code is required" },
        { status: 400 }
      );
    }

    const user = await authenticateUser(secretCode);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid secret code" },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    const response = NextResponse.json({
      user: {
        id: user.id,
        role: user.role,
        secretCode: user.secretCode,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

async function DELETE() {
  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.delete("auth-token");
  return response;
}

module.exports = { POST, DELETE };
