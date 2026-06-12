# JBDH – Om tjänsten

JBDH är under intensiv utveckling och den här sidan är garanterat inte up-to-date med hur saker fungerar. Så läs med en stor nypa salt.

---

## Hur JBDH fungerar

### CV-hantering

När du laddar upp ett CV (PDF, DOCX, MD, RTF, TXT) extraheras texten automatiskt lokalt i webbläsaren. Du blir sedan ombedd att anonymisera texten. (Våra script klarar av att maskera de flesta telefonnummer, personnummer och mejladresser, men har svårt med namn och adresser.) Sedan kan den anonymiserade texten skickas till en AI-modell (För tillfället används olika modeller på olika platser i tjänsten) för analys. Analysen producerar ett strukturerat resultat:

- Upp till 10 lämpliga jobbtitlar för dig
- Tekniska kompetenser (hard skills)
- Mjuka kompetenser (soft skills)
- Erfarenheter med titlar och uppskattad varaktighet
- Utbildningar och certifieringar

Resultatet lagras i databasen kopplat till ditt konto och används sedan som underlag för matchning.

### Inkommande jobb

Jobbannonser hämtas in från externa källor (bl.a. Platsbanken/JobTech) och lagras med titel, företag, plats, beskrivning, kompetenskrav och ansökningsdatum. Varje annons vektorsätts semantiskt med hjälp av MiniLM-modellen — en matematisk representation av annonsens innebörd som möjliggör snabb likhetssökning.

### Matchningsprocessen

Matchning sker i två steg:

**Steg 1 – Vektorsökning:** Ditt CV-svar vektorsätts och jämförs med alla jobbvektorerna via kosinuslikhet. De mest relevanta jobben väljs ut snabbt utan att AI behöver analysera varje annons.

**Steg 2 – AI-djupanalys:** För varje utvalt jobb gör AI en detaljerad jämförelse och producerar:
- Matchande punkter (vad du har som stämmer)
- Ej matchande punkter (gap)
- Förbättringsmöjligheter
- Konkreta coachtips

Det finns även en realtidsanalys (CV mot valfri jobbannons) via Server-Sent Events — resultatet streamar in progressivt med procentindikator och sammanfattning av styrkor, svagheter och relevanta erfarenheter.

Slutpoängen väger yrkesriktning 70 % och kompetenser 30 %. Systemet penaliserar kraftigt matchningar utanför ens kompetensdomän (t.ex. IT-profil mot vårdjobb).

### Vem tjänar på JBDH?

- **Arbetssökande** — Laddar upp CV, får AI-analys av sin profil och automatiska jobbrekommendationer med förklaring av varför varje jobb passar.
- **Job-brokers / rekryterare** — Kan äga och hantera kandidatprofiler, matcha mot specifika annonser och se detaljerade fit-rapporter per kandidat/jobb-kombination.
- **Konsultfirmor** — Kan matcha konsulter mot uppdrag och identifiera kompetensgap inför kommande projekt.


---

## Till dig som letar jobb

Hej! Tröttnat på att skicka samma CV till femtio jobb och aldrig höra något?

JBDH gör jobbet åt dig. Du laddar upp ditt CV — det tar trettio sekunder — och systemet läser igenom det med AI och förstår vad du faktiskt kan, inte bara vad som råkar stå med rätt nyckelord. Sedan matchar det dig mot riktiga jobbannonser och förklarar *varför* varje jobb passar dig — och vad som eventuellt saknas.

Det är som att ha en karriärcoach som jobbat hela natten och lagt fram de tio bästa jobben på frukostbordet. Du slipper skrolla dig igenom hundratals irrelevanta annonser.

Du kan också klistra in vilken jobbannons som helst och få en realtidsanalys — ser du ett jobb på LinkedIn eller Blocket, klistra in texten och få veta inom en minut hur bra du matchar och vad du ska lyfta fram i ditt brev.

Gratis att testa. Inget BS.

---

## Till dig som vill tjäna pengar på jobbannonser

Har du ett nätverk av kandidater, eller jobbar du på ett bemanningsföretag, rekryteringsbyrå eller kör något liknande på sidan?

Då vet du att problemet inte är att hitta jobb — det finns hur många annonser som helst. Problemet är att matcha rätt person mot rätt annons utan att lägga tio timmar på det manuellt.

JBDH löser precis det. Du lägger in dina kandidaters CV:n, systemet analyserar dem med AI och du kan sedan matcha dem mot specifika uppdrag på sekunder. Du ser direkt vem som passar bäst, varför de passar, och vad som saknas — utan att läsa ett enda dokument själv.

Resultatet: du kan hantera fler kandidater, svara snabbare på förfrågningar och se mer professionell ut mot kunderna. Det som tidigare tog en halv dag tar nu fem minuter.

Ju fler kandidater du har i systemet, desto mer värde får du ut av det.

## Kontakt

Har du frågor eller vill veta mer? Hör av dig till oss.