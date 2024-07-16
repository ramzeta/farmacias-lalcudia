import { Component, OnInit } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import * as cheerio from 'cheerio';
import axios from 'axios'; 

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  data: any[] = [];

  constructor(private http: HTTP) {}

  ngOnInit() {
    this.fetchData();
  }

  async fetchData() {
    try {
      const apiKey = 'c71469b44f584c20bec26290dcba5a18';
      const url = `http://api.scraperapi.com?api_key=${apiKey}&url=https://www.lalcudia.com/web/farmacies_nw.php`;
      console.log(`Fetching data from URL: ${url}`);

      const response = await axios.get(url);
      if(response.status === 200){
        const $ = cheerio.load(response.data);
        let results: { date: string, guardia: string, reforc: string, guardiaLocation?: string, reforcLocation?: string }[] = [];

        // Regex para extraer las guardias
        const guardiaRegex = /<strong><br>([^<]+)<\/strong><font\s+color="green"><br>GUÀRDIA---&gt; <\/font>([^<]+)<font\s+color="red">\s*<br> REFORÇ---&gt; <\/font>([^<]*)<br>/g;

        // Extraer guardias
        const tdElement = $('td.Estilo18');
        tdElement.each((index, element) => {
          const htmlContent = $(element).html();
          let match;
          while (htmlContent && (match = guardiaRegex.exec(htmlContent)) !== null) {
              const date = match[1].trim();
              const guardia = match[2].trim();
              const reforc = match[3].trim();
              
              results.push({
                  date,
                  guardia,
                  reforc
              });
          }
        });

        // Regex para extraer las ubicaciones
        const ubicacionRegex = /<strong>\s*(.+?)<\/strong><br>\s*(.+?)\s*-\s*Tel.\s*(\d+\s*\d+\s*\d+)\s*-\s*<a href="(.+?)"/g;

        const ubicaciones: { [key: string]: string } = {};
        $('.Estilo18').each((index, element) => {
            const htmlContent = $(element).html();
            let match;
            while (htmlContent && (match = ubicacionRegex.exec(htmlContent)) !== null) {
                const name = match[1].trim();
                const address = match[2].trim();
                ubicaciones[name] = address;
            }
        });

        // Añadir ubicaciones a los resultados
        results = results.map(item => ({
          ...item,
          guardiaLocation: ubicaciones[item.guardia] || 'N/A',
          reforcLocation: item.reforc ? (ubicaciones[item.reforc] || 'N/A') : 'N/A'
        }));

        this.data = results;
        console.log('Data:', this.data);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
}
