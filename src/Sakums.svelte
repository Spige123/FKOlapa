<script>
    import {createEventDispatcher} from 'svelte';
    const dispatch = createEventDispatcher();

    
    const switchPG = () => {
        dispatch("switchPie", 2);
    }

</script>

<main>
    <div class='text'>
        <h1>Fizikas Komandu Olimpiāde 2020./2021.</h1>
        <p>Sveiks!</p>
        <p>Ar prieku paziņojam, ka arī šogad notiks Fizikas Komandu Olimpiāde! Olimpiāde norisināsies 27. februārī, no 10.00 līdz 13.00, attālinātā formā, izmantojot edu.lu.lv vidi.</p>
        <p>Ja esi 8. – 12. klases skolēns un vēlies piedalīties olimpiādē, rīkojies šādi:</p>
        <ol>
            <li>Atrodi citus fizikas entuziastus un savāc 2 – 5 cilvēku komandu. Visiem komandas dalībniekiem <u>nav</u> jābūt no vienas skolas vai klases.</li>
            <li>Pārliecinies, vai visi komandas dalībnieki ir reģistrēti edu.lu.lv vietnē. Ja kādreiz esi piedalījies fizikas, ķīmijas, bioloģijas vai citās novada olimpiādēs, tu visticamāk esi reģistrēts! Ja kādam komandas dalībniekam nav edu.lu.lv konta, to var iegūt pie savas skolas atbildīgā par olimpiādēm (pajautā savam fizikas skolotājam!). </li>
            <li>Dodies uz šīs vietnes sadaļu <button on:click={switchPG}>Pieteikšanās</button> un aizpildi tur redzamo anketu!</li>
            <li>48 stundu laikā pēc anketas iesniegšanas katrs komandas dalībnieks tiks reģistrēts komandu olimpiādes edu.lu.lv kursā. Ieejot vietnē edu.lu.lv, tev vajadzētu redzēt kursu Fizikas Komandu Olimpiāde. Ja nedēļu pēc reģistrācijas neredzi šo kursu, raksti uz e-pastu <a class="mailLink" href="mailto:fizikasko@gmail.com">fizikasko@gmail.com</a>!</li>
            <li>Citu nepieciešamo informāciju atradīsi edu.lu.lv kursā vai olimpiādes nolikumā.</li>
        </ol>
        <p>Pirms 27. februāra pārliecinies, ka viss šeit uzskaitītais izpildās: </p>
        <ol>
            <li>Visi komandas dalībnieki ir reģistrēti un var ieiet olimpiādes kursā edu.lu.lv.</li>
            <li>Komandai ir veids kā droši sazināties olimpiādes laikā – iesakām izmantot Zoom, Discord, Google Meet, Teams vai tamlīdzīgu saziņas veidu. </li>
            <li>Tu esi izlasījis olimpiādes noteikumus un saproti, kā norisināsies olimpiāde.</li>
        </ol>
        <p>Olimpiādes dienā: </p>
        <ol>
            <li>Sākot no 10.00 katrs komandas dalībnieks varēs atvērt uzdevumus. To risināšanai būs dotas 3 astronomiskās stundas, laika atskaite katram dalībniekam ir individuāla. </li>
            <li>Uzdevumu izpildes laiks slēdzas 13.15 (neatkarīgi no sākšanas laika – sāc risināt uzdevumus starp 10.00 un 10.15)! </li>
            <li>Uzdevumus komanda risina kopīgi, bet katrā atbilžu lodziņā atbildi aicinām rakstīt tieši vienam dalībniekam. <strong>Ja uz vienu jautājumu atbildes būs iesnieguši vairāki komandas dalībnieki, jautājums netiks vērtēts, un komanda par to saņems 0 punktus. </strong></li>
            <li>Uz katru jautājumu atbildēt var cits komandas dalībnieks – komandas darba vērtēšanā izmantosim visu dalībnieku iesniegtās atbildes.</li>
        </ol>
        <p>Ja tev ir kādas neskaidrības par olimpiādes norisi, raksti uz e-pastu <a class="mailLink" href="mailto:fizikasko@gmail.com">fizikasko@gmail.com</a>!</p>
        <div style="display: inline-block;">
            <div class="dokDiv">
                <a class="dokSaite" href="/FKO_Nolikums_2021.pdf">📄 Nolikums <small>(pdf)</small></a>
            </div>
        </div>
    </div>
</main>

<style>
    .text {
        font-size: 1vw;
    }
    h1{
        font-size: 2vw;
    }
    a {
        color: rgb(255, 110, 110);
    }
    button {
        background-color: transparent;
        border: none;
        font-size: 1vw;
        font: inherit;
        margin: none;
        padding: 0;
        color: rgb(255, 110, 110);
        cursor: pointer;
    }
	@media (max-width:960px) {
        .text {
            font-size: 3vw;
        }
        h1{
            font-size: 5vw;
        }
    }
</style>