exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST" && event.httpMethod !== "GET") {
        return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: "Mangler API-nøkkel på serveren." }) };
    }

    // ==========================================
    // HER LIGGER "HJERNEN" (STRUKTURERT DATA)
    // ==========================================
    const CV_DATA = {
        navn: "Are Martin Kallåk",
        tittel: "Porteføljeansvarlig, Rådgiver & Webmaster",
        detaljer: "45 år | Gulset, Skien",
        epost: "martkal@gmail.com",
        telefon: "+47 413 97 720",
        profil: "Erfaren rådgiver med solid bakgrunn i kundestøtte, HMS-systemer (SaaS) og veiledning (B2B). Trives i skjæringspunktet mellom mennesker og teknologi, og brenner for at digitale systemer skal forenkle arbeidshverdagen. Jeg er kreativ, nysgjerrig og lærer ekstremt fort. Privat bor jeg på Gulset med samboer, to barn (8 og 9 år), to hunder og en katt. Fritiden går til fisking, turer i skog og mark, nerding med webutvikling, og gitarspilling (men jeg synger definitivt ikke!).",
        kompetanse: ["HMS-styringssystemer (SaaS)", "CRM (HubSpot)", "B2B Kundestøtte", "Webutvikling (Front-end)", "SEO", "Risikovurdering", "Prosjektledelse", "Internkontrollforskriften"],
        erfaring: [
            { rolle: "Porteføljeansvarlig / Account Manager", sted: "Avonova Norge", aar: "02.2021 - nåværende", beskrivelse: "Veiledning og oppfølging av en portefølje på 200+ B2B-kunder ifm. HMS-lovgivning. Opplæring i bruk av digitalt HMS-system (SaaS). Administrasjon av kundedata i HubSpot CRM. Har også bidratt i utvikling av nye nettsider og digitale verktøy." },
            { rolle: "Webmaster / Administrator", sted: "Fysionett", aar: "01.2009 - nåværende", beskrivelse: "Innholdsproduksjon, SEO, webutvikling og teknisk drift. Lærte meg webutvikling og SEO gjennom dette prosjektet." },
            { rolle: "Konsulent", sted: "Sykehuset Telemark / Pasientreiser", aar: "08.2019 - 01.2020", beskrivelse: "Saksbehandling, veiledning og registrering av reiser for pasienter." },
            { rolle: "Veileder", sted: "NAV Skien", aar: "06.2016 - 06.2018", beskrivelse: "Oppfølging og veiledning av brukere, saksbehandling etter gjeldende lovverk, administrering av utbetalinger." },
            { rolle: "Fysioterapeut", sted: "Grenland Fysioterapi", aar: "09.2009 - 05.2016", beskrivelse: "Individuell behandling, veiledning, organisering av gruppeaktiviteter og kurs." },
            { rolle: "HMS-rådgiver / Fysioterapeut", sted: "Frisk i nord BHT", aar: "09.2007 - 05.2009", beskrivelse: "Veiledning og kartlegging av systematisk HMS-arbeid for medlemsbedrifter." }
        ],
        utdanning: [
            { grad: "Front-end webutvikling & Prosjektledelse", sted: "Universitetet i Sørøst-Norge", aar: "2019 - 2020" },
            { grad: "Bachelor Fysioterapi", sted: "Hogeschool van Amsterdam", aar: "2004 - 2007" },
            { grad: "Lydtekniker", sted: "NISS", aar: "2001 - 2002" }
        ]
    };

    // ==========================================
    // PDF/CV-GENERATOR (AKTIVERES VED "LAST NED CV")
    // ==========================================
    if (event.httpMethod === "GET") {
        const kompetanseTags = CV_DATA.kompetanse.map(k => `<span style="background: #e2e8f0; color: #1e293b; padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 600; letter-spacing: 0.3px;">${k}</span>`).join('');
        
        const erfaringHtml = CV_DATA.erfaring.map(e => `
            <div style="margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                    <h3 style="font-size: 17px; font-weight: 700; color: #1e293b; margin: 0;">${e.rolle} <span style="font-weight: 400; color: #64748b;">| ${e.sted}</span></h3>
                    <span style="font-size: 14px; color: #0ea5e9; font-weight: 600;">${e.aar}</span>
                </div>
                <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 15px;">${e.beskrivelse}</p>
            </div>
        `).join('');

        const utdanningHtml = CV_DATA.utdanning.map(u => `
            <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0;">${u.grad}</h3>
                    <span style="font-size: 14px; color: #64748b; font-weight: 500;">${u.aar}</span>
                </div>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">${u.sted}</p>
            </div>
        `).join('');

        const html = `
        <!DOCTYPE html>
        <html lang="no">
        <head>
            <meta charset="UTF-8">
            <title>CV - ${CV_DATA.navn}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; background: #f8fafc; display: flex; justify-content: center; padding: 40px 20px; margin: 0; }
                .cv-container { background: white; max-width: 800px; width: 100%; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); border-radius: 16px; overflow: hidden; }
                .header { background: #0f172a; color: white; padding: 48px 40px; text-align: center; }
                .header h1 { margin: 0; font-size: 38px; font-weight: 800; letter-spacing: -1px; }
                .header h2 { margin: 12px 0 0 0; font-size: 20px; font-weight: 400; color: #94a3b8; }
                .header p { margin: 20px 0 0 0; font-size: 14px; color: #cbd5e1; font-weight: 500; letter-spacing: 0.5px;}
                .content { padding: 48px 40px; }
                .section-title { font-size: 14px; font-weight: 700; color: #0ea5e9; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 24px; margin-top: 0; text-transform: uppercase; letter-spacing: 1.2px;}
                .section { margin-bottom: 48px; }
                .profil-tekst { font-size: 16px; line-height: 1.7; color: #334155; margin: 0; }
                .tags { display: flex; flex-wrap: wrap; gap: 8px; }
                @media print {
                    body { padding: 0; background: white; }
                    .cv-container { box-shadow: none; border-radius: 0; max-width: 100%; }
                    @page { margin: 0; }
                }
            </style>
        </head>
        <body onload="setTimeout(() => window.print(), 500)">
            <div class="cv-container">
                <div class="header">
                    <h1>${CV_DATA.navn}</h1>
                    <h2>${CV_DATA.tittel}</h2>
                    <p>${CV_DATA.detaljer} &bull; ${CV_DATA.epost} &bull; ${CV_DATA.telefon}</p>
                </div>
                <div class="content">
                    <div class="section">
                        <h2 class="section-title">Profil</h2>
                        <p class="profil-tekst">${CV_DATA.profil}</p>
                    </div>
                    <div class="section">
                        <h2 class="section-title">Nøkkelkompetanse</h2>
                        <div class="tags">${kompetanseTags}</div>
                    </div>
                    <div class="section">
                        <h2 class="section-title">Arbeidserfaring</h2>
                        ${erfaringHtml}
                    </div>
                    <div class="section">
                        <h2 class="section-title">Utdanning</h2>
                        ${utdanningHtml}
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
        return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: html };
    }

    const SYSTEM_PROMPT = `
        Du er en profesjonell, sjarmerende og minimalistisk AI-assistent for kandidaten ${CV_DATA.navn}. 
        Din oppgave er å svare på spørsmål fra potensielle arbeidsgivere basert KUN på følgende data:
        
        ${JSON.stringify(CV_DATA, null, 2)}
        
        Dine regler:
        1. Vær selvsikker og profesjonell, men med et lunt glimt i øyet. Skriv på norsk. Svar kun på ting som har med Are Martin og hans karriere og bakgrunn og gjøre.
        2. Bruk detaljene om Gulset, barna, hundene, katten, turglede, fisking og gitarspilling (uten sang!) for å skape personlighet hvis brukeren spør om fritid eller hvem Are Martin er. Hvis de spør om lønn si at de først må kalle meg inn til intervju
        3. SPESIALREGEL FOR MANGLENDE KOMPETANSE: Hvis noen spør om et spesifikt verktøy, rammeverk eller kompetanse Are Martin *ikke* har listet opp (f.eks. "Kan du Python?", "Har du erfaring med SAP?"), skal du svare ærlig at han ikke har formell erfaring med akkurat det, MEN du må ALLTID umiddelbart understreke at Are Martin er nysgjerrig, svært lærevillig og tar ny teknologi og nye systemer ekstremt fort og at han har brukt mange ulike lignende systemer gjennom sin karriere.
        4. Svar kort, presist og velformulert. Unngå "vegg av tekst".
        
        VIKTIG - DYNAMISKE FLERVALG (TIPS):
        For å engasjere arbeidsgiveren, skal du i HVERT ENESTE SVAR (unntatt i quiz-modus) avslutte med 2-3 relevante oppfølgingsspørsmål formatert nøyaktig slik:
        [TIPS: Spørsmål 1]
        [TIPS: Spørsmål 2]
        Finn på dine egne basert på konteksten. Hvis dere snakker om HMS, foreslå: [TIPS: Hvordan jobber du med SaaS-systemer?]. Hvis dere snakker om fritid, foreslå: [TIPS: Hva slags gitar spiller du?]

        🎮 SPESIALFUNKSJON: QUIZ-MODUS
        Hvis brukeren sier at de vil ta en quiz, spille et spill, eller trykker på quiz-knappen, går du inn i "Quiz-modus".
        Regler for Quiz-modus:
        1. Vær en engasjerende quizmaster.
        2. Still KUN ETT spørsmål om gangen basert på Ares CV (f.eks. utdanning, hobby, antall hunder).
        3. Bruk TIPS-formatet til å gi 3 svaralternativer (A, B, C) der kun ett er riktig. 
           Eksempel: [TIPS: Trommer] [TIPS: Gitar] [TIPS: Piano]
        4. Vent på brukerens svar.
        5. Når de svarer, reager med entusiasme (eller litt vennlig erting hvis de tar feil), avslør fasiten kort, og still neste spørsmål (eller spør om de vil ha flere spørsmål).
    `;

try {
        const body = JSON.parse(event.body);
        
        body.systemInstruction = {
            parts: [{ text: SYSTEM_PROMPT }]
        };
        
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;        
        
    const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

       if (!response.ok) {
            const googleError = await response.text();
            throw new Error(`Google API svarte med feilkode: ${response.status}. Detaljer: ${googleError}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Feil i backend:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Noe gikk galt på serveren." })
        };
    }
};
