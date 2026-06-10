import base64
import os

logo_path = r"C:\Users\ghula\OneDrive\Desktop\FYP poster\extracted_docx_assets\COMSATS.png"
logo_base64 = ""
if os.path.exists(logo_path):
    with open(logo_path, "rb") as img_file:
        b64_string = base64.b64encode(img_file.read()).decode("utf-8")
        logo_base64 = f"data:image/png;base64,{b64_string}"

nextjs_svg = "data:image/svg+xml;base64," + base64.b64encode(b"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><circle r="90" cx="90" cy="90" fill="#0F172A"/><path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="#fff"/><path d="M115.212 54V125.97H103.098V54H115.212Z" fill="#fff"/></svg>""").decode("utf-8")

fastapi_svg = "data:image/svg+xml;base64," + base64.b64encode(b"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="#059669"/><path d="M110 40 L50 120 h40 v40 l60 -80 h-40 z" fill="#fff"/></svg>""").decode("utf-8")

turso_svg = "data:image/svg+xml;base64," + base64.b64encode(b"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="#0F172A"/><path d="M60 80 v40 c0 15 80 15 80 0 v-40" fill="#10B981"/><ellipse cx="100" cy="80" rx="40" ry="15" fill="#34D399"/><ellipse cx="100" cy="120" rx="40" ry="15" fill="#059669"/></svg>""").decode("utf-8")

svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1728 4320" width="24in" height="60in">
  <defs>
    <!-- Light Background Gradient -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#F1F5F9" />
    </linearGradient>
    
    <!-- Accent Gradient (Premium Tech Blue/Purple) -->
    <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>

    <!-- Success/Green Gradient -->
    <linearGradient id="success-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <!-- Soft Shadows -->
    <filter id="soft-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="12" stdDeviation="25" flood-color="#0F172A" flood-opacity="0.06"/>
    </filter>
    <filter id="medium-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="20" stdDeviation="35" flood-color="#0F172A" flood-opacity="0.1"/>
    </filter>

    <!-- Glassmorphism Filter -->
    <filter id="glass">
      <feGaussianBlur stdDeviation="15" result="blur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.8"/>
      </feComponentTransfer>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="1728" height="4320" fill="url(#bg-grad)" />

  <!-- Background Flourishes -->
  <circle cx="200" cy="400" r="400" fill="#E0E7FF" opacity="0.6" filter="url(#glass)"/>
  <circle cx="1500" cy="900" r="500" fill="#DBEAFE" opacity="0.5" filter="url(#glass)"/>
  <circle cx="300" cy="3000" r="450" fill="#E0E7FF" opacity="0.4" filter="url(#glass)"/>

  <!-- Top Blue Branding Bar -->
  <rect width="1728" height="24" fill="url(#accent-grad)" />

  <!-- HEADER SECTION -->
  <g transform="translate(0, 120)">
    <image x="120" y="0" width="300" height="300" href="{logo_base64}" preserveAspectRatio="xMidYMid meet" />
    <text x="460" y="140" fill="#0F172A" font-family="Poppins, Arial, sans-serif" font-size="120" font-weight="800" letter-spacing="-2">MegiLance</text>
    <text x="465" y="210" fill="#2563EB" font-family="Poppins, Arial, sans-serif" font-size="45" font-weight="600" letter-spacing="1">NEXT-GENERATION FREELANCING</text>
    <text x="465" y="270" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="34">AI-powered, zero-fee disputes, and hybrid-crypto escrow.</text>
  </g>

  <!-- HERO/INTERFACE MOCKUP -->
  <g transform="translate(120, 500)">
    <!-- Browser Window Container -->
    <rect x="0" y="0" width="1488" height="800" rx="30" fill="#FFFFFF" filter="url(#medium-shadow)" />
    
    <!-- Browser Chrome -->
    <rect x="0" y="0" width="1488" height="60" rx="30" fill="#F1F5F9" />
    <!-- Hide bottom radius of chrome -->
    <rect x="0" y="30" width="1488" height="30" fill="#F1F5F9" />
    <circle cx="40" cy="30" r="10" fill="#FF5F56" />
    <circle cx="75" cy="30" r="10" fill="#FFBD2E" />
    <circle cx="110" cy="30" r="10" fill="#27C93F" />
    <rect x="200" y="15" width="1088" height="30" rx="15" fill="#E2E8F0" />
    <text x="744" y="37" fill="#64748B" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="500" text-anchor="middle">https://megilance.site/dashboard</text>
    <rect x="0" y="60" width="1488" height="1" fill="#E2E8F0" />

    <!-- Dashboard App Layout -->
    <!-- Sidebar -->
    <rect x="0" y="61" width="300" height="739" fill="#0F172A" />
    <rect x="0" y="770" width="300" height="30" rx="30" fill="#0F172A" /> <!-- bottom radius fix -->
    <circle cx="60" cy="110" r="20" fill="#3B82F6" />
    <text x="95" y="118" fill="#FFFFFF" font-family="Poppins" font-size="20" font-weight="700">MegiLance</text>
    
    <!-- Sidebar Menu Items -->
    <rect x="30" y="170" width="240" height="40" rx="10" fill="#1E293B" />
    <rect x="50" y="185" width="120" height="10" rx="5" fill="#3B82F6" />
    <rect x="50" y="245" width="150" height="10" rx="5" fill="#475569" />
    <rect x="50" y="305" width="100" height="10" rx="5" fill="#475569" />
    <rect x="50" y="365" width="140" height="10" rx="5" fill="#475569" />
    <rect x="50" y="425" width="110" height="10" rx="5" fill="#475569" />

    <!-- Main Content Header -->
    <rect x="340" y="100" width="500" height="20" rx="10" fill="#E2E8F0" />
    <rect x="340" y="140" width="300" height="12" rx="6" fill="#CBD5E1" />
    <!-- User Avatar -->
    <circle cx="1400" cy="110" r="25" fill="#2563EB" />
    <rect x="1250" y="105" width="110" height="10" rx="5" fill="#E2E8F0" />

    <!-- KPI Cards Setup -->
    <rect x="340" y="200" width="350" height="150" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#soft-shadow)"/>
    <rect x="370" y="230" width="40" height="40" rx="10" fill="#DBEAFE" />
    <text x="370" y="300" fill="#64748B" font-family="Inter" font-size="16">Total Earnings</text>
    <text x="370" y="330" fill="#0F172A" font-family="Poppins" font-size="28" font-weight="700">$42,500.00</text>

    <rect x="710" y="200" width="350" height="150" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#soft-shadow)"/>
    <rect x="740" y="230" width="40" height="40" rx="10" fill="#DCFCE7" />
    <text x="740" y="300" fill="#64748B" font-family="Inter" font-size="16">AI Matching Rating</text>
    <text x="740" y="330" fill="#0F172A" font-family="Poppins" font-size="28" font-weight="700">98.4% Top Tier</text>

    <rect x="1080" y="200" width="350" height="150" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#soft-shadow)"/>
    <rect x="1110" y="230" width="40" height="40" rx="10" fill="#F3E8FF" />
    <text x="1110" y="300" fill="#64748B" font-family="Inter" font-size="16">Active Projects</text>
    <text x="1110" y="330" fill="#0F172A" font-family="Poppins" font-size="28" font-weight="700">14 Escrow Locked</text>

    <!-- Main Chart Area -->
    <rect x="340" y="380" width="720" height="370" rx="20" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
    <path d="M 340 600 Q 450 500 550 550 T 700 650 T 850 450 T 1060 400" fill="none" stroke="#3B82F6" stroke-width="6" />
    <path d="M 340 600 Q 450 500 550 550 T 700 650 T 850 450 T 1060 400 L 1060 750 L 340 750 Z" fill="#DBEAFE" opacity="0.4" />
    <line x1="380" y1="450" x2="1020" y2="450" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="8 8"/>
    <line x1="380" y1="550" x2="1020" y2="550" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="8 8"/>
    <line x1="380" y1="650" x2="1020" y2="650" stroke="#CBD5E1" stroke-width="1" stroke-dasharray="8 8"/>

    <!-- Side Tasks Area -->
    <rect x="1080" y="380" width="350" height="370" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#soft-shadow)" />
    <rect x="1110" y="410" width="180" height="15" rx="7" fill="#E2E8F0" />
    
    <rect x="1110" y="460" width="40" height="40" rx="20" fill="#E2E8F0" />
    <rect x="1165" y="470" width="220" height="8" rx="4" fill="#CBD5E1" />
    <rect x="1165" y="485" width="120" height="6" rx="3" fill="#94A3B8" />

    <rect x="1110" y="530" width="40" height="40" rx="20" fill="#E2E8F0" />
    <rect x="1165" y="540" width="200" height="8" rx="4" fill="#CBD5E1" />
    <rect x="1165" y="555" width="140" height="6" rx="3" fill="#94A3B8" />

    <rect x="1110" y="600" width="40" height="40" rx="20" fill="#E2E8F0" />
    <rect x="1165" y="610" width="240" height="8" rx="4" fill="#CBD5E1" />
    <rect x="1165" y="625" width="100" height="6" rx="3" fill="#94A3B8" />

    <rect x="1110" y="670" width="40" height="40" rx="20" fill="#E2E8F0" />
    <rect x="1165" y="680" width="180" height="8" rx="4" fill="#CBD5E1" />
    <rect x="1165" y="695" width="150" height="6" rx="3" fill="#94A3B8" />
  </g>

  <!-- BENTO BOX SECTION (Features) -->
  <g transform="translate(120, 1450)">
    <text x="0" y="0" fill="#0F172A" font-family="Poppins, Arial, sans-serif" font-size="70" font-weight="800">Why MegiLance?</text>
    
    <!-- Bento 1: AI Matching -->
    <rect x="0" y="60" width="700" height="400" rx="40" fill="#FFFFFF" filter="url(#soft-shadow)" stroke="#E2E8F0" stroke-width="1.5" />
    <rect x="50" y="110" width="80" height="80" rx="20" fill="#E0E7FF" />
    <text x="90" y="165" fill="#2563EB" font-family="Poppins" font-size="45" text-anchor="middle">✧</text>
    <text x="50" y="250" fill="#0F172A" font-family="Poppins, Arial, sans-serif" font-size="40" font-weight="700">AI-Smart Matching</text>
    <text x="50" y="300" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">Traditional platforms use basic keyword</text>
    <text x="50" y="340" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">matching. We use NLP Sentiment Analysis</text>
    <text x="50" y="380" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">and skill forecasting for precise pairings.</text>

    <!-- Bento 2: Escrow -->
    <rect x="740" y="60" width="748" height="400" rx="40" fill="#FFFFFF" filter="url(#soft-shadow)" stroke="#E2E8F0" stroke-width="1.5" />
    <rect x="790" y="110" width="80" height="80" rx="20" fill="#DCFCE7" />
    <text x="830" y="165" fill="#10B981" font-family="Poppins" font-size="45" text-anchor="middle">$</text>
    <text x="790" y="250" fill="#0F172A" font-family="Poppins, Arial, sans-serif" font-size="40" font-weight="700">Hybrid Escrow System</text>
    <text x="790" y="300" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">Integrating classic Stripe Payments</text>
    <text x="790" y="340" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">alongside Web3 Crypto support for</text>
    <text x="790" y="380" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">borderless, un-censorable transactions.</text>
    
    <!-- Bento 3: Edge DB -->
    <rect x="0" y="500" width="1488" height="250" rx="40" fill="url(#accent-grad)" filter="url(#medium-shadow)" />
    <text x="70" y="600" fill="#FFFFFF" font-family="Poppins, Arial, sans-serif" font-size="45" font-weight="700">Near-Zero Scalability with Turso at the Edge</text>
    <text x="70" y="670" fill="#E0E7FF" font-family="Inter, Arial, sans-serif" font-size="28">By replacing hefty standard instances with LibSQL over Turso Edge DB,</text>
    <text x="70" y="710" fill="#E0E7FF" font-family="Inter, Arial, sans-serif" font-size="28">we slashed infrastructural cost and latency passing savings back.</text>
    <circle cx="1200" cy="625" r="150" fill="#FFFFFF" opacity="0.1" />
    <circle cx="1300" cy="575" r="80" fill="#FFFFFF" opacity="0.15" />
  </g>

  <!-- SYSTEM ARCHITECTURE (WITH REAL LOGOS) -->
  <g transform="translate(120, 2400)">
    <text x="0" y="0" fill="#0F172A" font-family="Poppins, Arial, sans-serif" font-size="70" font-weight="800">Deep-Tech Architecture</text>
    
    <rect x="0" y="60" width="1488" height="750" rx="40" fill="#FFFFFF" filter="url(#soft-shadow)" stroke="#E2E8F0" stroke-width="1.5" />
    
    <!-- Users Node -->
    <rect x="150" y="160" width="280" height="200" rx="30" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2" />
    <text x="290" y="250" fill="#0F172A" font-family="Poppins, Arial, sans-serif" font-size="36" font-weight="700" text-anchor="middle">Users</text>
    <text x="290" y="300" fill="#64748B" font-family="Inter, Arial, sans-serif" font-size="22" text-anchor="middle">Client / Freelancer</text>

    <!-- NextJS Node -->
    <rect x="604" y="160" width="280" height="200" rx="30" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2" />
    <!-- Embedded Next.js SVG -->
    <image x="694" y="180" width="100" height="100" href="{nextjs_svg}" />
    <text x="744" y="320" fill="#0F172A" font-family="Poppins, Arial, sans-serif" font-size="30" font-weight="700" text-anchor="middle">Next.js 16</text>

    <!-- FastAPI Node -->
    <rect x="604" y="460" width="280" height="200" rx="30" fill="#E0E7FF" stroke="#3B82F6" stroke-width="2" />
    <!-- Embedded FastAPI SVG -->
    <image x="694" y="480" width="100" height="100" href="{fastapi_svg}" />
    <text x="744" y="620" fill="#1D4ED8" font-family="Poppins, Arial, sans-serif" font-size="30" font-weight="700" text-anchor="middle">FastAPI</text>

    <!-- Turso Node -->
    <rect x="1058" y="460" width="280" height="200" rx="30" fill="#DCFCE7" stroke="#10B981" stroke-width="2" />
    <!-- Embedded Turso SVG representation -->
    <image x="1148" y="480" width="100" height="100" href="{turso_svg}" />
    <text x="1198" y="620" fill="#047857" font-family="Poppins, Arial, sans-serif" font-size="30" font-weight="700" text-anchor="middle">Turso DB</text>

    <!-- AI Services Node -->
    <rect x="150" y="460" width="280" height="200" rx="30" fill="#FDF4FF" stroke="#C026D3" stroke-width="2" />
    <text x="290" y="560" fill="#A21CAF" font-family="Poppins, Arial, sans-serif" font-size="40" font-weight="700" text-anchor="middle">✨ AI</text>
    <text x="290" y="620" fill="#C026D3" font-family="Inter, Arial, sans-serif" font-size="22" text-anchor="middle">Ranking &amp; NLP</text>

    <!-- Connecting Arrows -->
    <path d="M 430 260 L 584 260" fill="none" stroke="#94A3B8" stroke-width="6" marker-end="url(#arrow)" />
    <path d="M 744 360 L 744 440" fill="none" stroke="#94A3B8" stroke-width="8" marker-end="url(#arrow)" />
    <path d="M 884 560 L 1038 560" fill="none" stroke="#94A3B8" stroke-width="8" marker-end="url(#arrow)" />
    <path d="M 604 560 L 450 560" fill="none" stroke="#C026D3" stroke-width="8" marker-end="url(#arrow-purple)" />
    
    <text x="744" y="415" fill="#64748B" font-family="Inter" font-size="18" text-anchor="middle" font-weight="bold">REST API</text>
    
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
        <path d="M0,0 L0,6 L9,3 z" fill="#94A3B8" />
      </marker>
      <marker id="arrow-purple" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
        <path d="M0,0 L0,6 L9,3 z" fill="#C026D3" />
      </marker>
    </defs>
  </g>
  
  <!-- VISION, OBJECTIVES & IMPACT -->
  <g transform="translate(120, 3320)">
    <text x="0" y="0" fill="#0F172A" font-family="Poppins, Arial, sans-serif" font-size="55" font-weight="800">Project Vision &amp; Real-World Impact</text>
    
    <!-- Problem -->
    <rect x="0" y="60" width="470" height="350" rx="30" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#soft-shadow)" />
    <g transform="translate(40, 100)">
      <rect width="70" height="70" rx="20" fill="#FEE2E2" />
      <path d="M 35 20 L 35 40 M 35 50 L 35 55" stroke="#EF4444" stroke-width="6" stroke-linecap="round"/>
    </g>
    <text x="40" y="230" fill="#0F172A" font-family="Poppins, Arial, sans-serif" font-size="34" font-weight="700">The Problem</text>
    <text x="40" y="280" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">Gig platforms trap funds with</text>
    <text x="40" y="320" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">biased disputes, 20% fees,</text>
    <text x="40" y="360" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">and inefficient workflows.</text>

    <!-- Objectives -->
    <rect x="509" y="60" width="470" height="350" rx="30" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#soft-shadow)" />
    <g transform="translate(549, 100)">
      <rect width="70" height="70" rx="20" fill="#DBEAFE" />
      <circle cx="35" cy="35" r="16" fill="none" stroke="#2563EB" stroke-width="5"/>
      <circle cx="35" cy="35" r="6" fill="#2563EB"/>
    </g>
    <text x="549" y="230" fill="#0F172A" font-family="Poppins, Arial, sans-serif" font-size="34" font-weight="700">Core Objectives</text>
    <text x="549" y="280" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">• Build ~0% commission model</text>
    <text x="549" y="320" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">• Utilize AI for smart matching</text>
    <text x="549" y="360" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">• Implement Hybrid Web3 Escrow</text>

    <!-- Impact -->
    <rect x="1018" y="60" width="470" height="350" rx="30" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#soft-shadow)" />
    <g transform="translate(1058, 100)">
      <rect width="70" height="70" rx="20" fill="#DCFCE7" />
      <path d="M 25 45 L 45 25 M 45 25 L 30 25 M 45 25 L 45 40" fill="none" stroke="#10B981" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="35" cy="35" r="22" fill="none" stroke="#10B981" stroke-width="3" opacity="0.5"/>
    </g>
    <text x="1058" y="230" fill="#0F172A" font-family="Poppins, Arial, sans-serif" font-size="34" font-weight="700">Socio-Economic Impact</text>
    <text x="1058" y="280" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">Empowering global talent by</text>
    <text x="1058" y="320" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">removing payment borders</text>
    <text x="1058" y="360" fill="#475569" font-family="Inter, Arial, sans-serif" font-size="24">and restoring gig fairness.</text>
  </g>

  <!-- NAVY FOOTER -->
  <g transform="translate(0, 3950)">
    <rect width="1728" height="370" fill="#0F172A" />
    
    <text x="120" y="80" fill="#94A3B8" font-family="Poppins, Arial, sans-serif" font-size="26" font-weight="600">PROJECT BY:</text>
    <text x="120" y="130" fill="#FFFFFF" font-family="Poppins, Arial, sans-serif" font-size="36" font-weight="700">Ghulam Mujtaba (FA22-BSE-199)</text>
    <text x="120" y="180" fill="#FFFFFF" font-family="Poppins, Arial, sans-serif" font-size="36" font-weight="700">Muhammad Waqar Ul Mulk (FA22-BSE-153)</text>
    <text x="120" y="225" fill="#94A3B8" font-family="Inter, Arial, sans-serif" font-size="24">BS Software Engineering (FYP II)</text>
    
    <text x="1608" y="100" fill="#94A3B8" font-family="Poppins, Arial, sans-serif" font-size="30" font-weight="600" text-anchor="end">SUPERVISED BY:</text>
    <text x="1608" y="160" fill="#FFFFFF" font-family="Poppins, Arial, sans-serif" font-size="45" font-weight="700" text-anchor="end">Mr. Shahrukh Naeem (H-18)</text>
    <text x="1608" y="210" fill="#94A3B8" font-family="Inter, Arial, sans-serif" font-size="26" text-anchor="end">COMSATS University Islamabad, Lahore Campus</text>

    <!-- Separator Line -->
    <rect x="120" y="270" width="1488" height="1" fill="#1E293B" />
    <text x="864" y="320" fill="#3B82F6" font-family="Poppins, Arial, sans-serif" font-size="30" font-weight="700" text-anchor="middle" letter-spacing="2">MEGILANCE.SITE</text>
  </g>
</svg>"""

with open("E:\\MegiLance\\FYP_LightMode_Premium_Standee.svg", "w", encoding="utf-8") as f:
    f.write(svg_content)
    
print("Successfully generated final poster SVG with dashboard mockup and tech stack logos.")
