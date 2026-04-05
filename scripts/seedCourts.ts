import { db } from "../src/db";
import { courts } from "../src/db/schema";

const seedData = [
  { code: '8.26', name: 'Tribunal de Justiça do Estado de São Paulo', abbreviation: 'TJSP', type: 'estadual', state: 'SP', city: 'São Paulo' },
  { code: '2.03', name: 'Tribunal Regional Federal da 3ª Região', abbreviation: 'TRF3', type: 'federal', state: 'SP', city: 'São Paulo' },
  { code: '1.02', name: 'Tribunal Regional do Trabalho da 2ª Região', abbreviation: 'TRT2', type: 'trabalho', state: 'SP', city: 'São Paulo' },
  { code: '6.02', name: 'Tribunal Regional Eleitoral de São Paulo', abbreviation: 'TRE-SP', type: 'eleitoral', state: 'SP', city: 'São Paulo' },
  { code: '9.01', name: 'Superior Tribunal de Justiça', abbreviation: 'STJ', type: 'superior', state: 'DF', city: 'Brasília' },
  { code: '9.00', name: 'Supremo Tribunal Federal', abbreviation: 'STF', type: 'superior', state: 'DF', city: 'Brasília' },
  { code: '8.21', name: 'Tribunal de Justiça do Rio Grande do Sul', abbreviation: 'TJRS', type: 'estadual', state: 'RS', city: 'Porto Alegre' },
  { code: '8.19', name: 'Tribunal de Justiça do Rio de Janeiro', abbreviation: 'TJRJ', type: 'estadual', state: 'RJ', city: 'Rio de Janeiro' },
  { code: '8.13', name: 'Tribunal de Justiça de Minas Gerais', abbreviation: 'TJMG', type: 'estadual', state: 'MG', city: 'Belo Horizonte' },
  { code: '8.07', name: 'Tribunal de Justiça do Distrito Federal e Territórios', abbreviation: 'TJDFT', type: 'estadual', state: 'DF', city: 'Brasília' },
  { code: '2.01', name: 'Tribunal Regional Federal da 1ª Região', abbreviation: 'TRF1', type: 'federal', state: 'DF', city: 'Brasília' },
  { code: '2.02', name: 'Tribunal Regional Federal da 2ª Região', abbreviation: 'TRF2', type: 'federal', state: 'RJ', city: 'Rio de Janeiro' },
  { code: '2.04', name: 'Tribunal Regional Federal da 4ª Região', abbreviation: 'TRF4', type: 'federal', state: 'RS', city: 'Porto Alegre' },
  { code: '2.05', name: 'Tribunal Regional Federal da 5ª Região', abbreviation: 'TRF5', type: 'federal', state: 'PE', city: 'Recife' },
  { code: '1.01', name: 'Tribunal Regional do Trabalho da 1ª Região', abbreviation: 'TRT1', type: 'trabalho', state: 'RJ', city: 'Rio de Janeiro' },
  { code: '1.03', name: 'Tribunal Regional do Trabalho da 3ª Região', abbreviation: 'TRT3', type: 'trabalho', state: 'MG', city: 'Belo Horizonte' },
  { code: '1.04', name: 'Tribunal Regional do Trabalho da 4ª Região', abbreviation: 'TRT4', type: 'trabalho', state: 'RS', city: 'Porto Alegre' },
  { code: '1.05', name: 'Tribunal Regional do Trabalho da 5ª Região', abbreviation: 'TRT5', type: 'trabalho', state: 'BA', city: 'Salvador' },
  { code: '6.01', name: 'Tribunal Regional Eleitoral do Rio de Janeiro', abbreviation: 'TRE-RJ', type: 'eleitoral', state: 'RJ', city: 'Rio de Janeiro' },
  { code: '6.03', name: 'Tribunal Regional Eleitoral de Minas Gerais', abbreviation: 'TRE-MG', type: 'eleitoral', state: 'MG', city: 'Belo Horizonte' },
  { code: '6.04', name: 'Tribunal Regional Eleitoral do Rio Grande do Sul', abbreviation: 'TRE-RS', type: 'eleitoral', state: 'RS', city: 'Porto Alegre' },
  { code: '6.05', name: 'Tribunal Regional Eleitoral da Bahia', abbreviation: 'TRE-BA', type: 'eleitoral', state: 'BA', city: 'Salvador' },
  { code: '9.02', name: 'Tribunal Superior do Trabalho', abbreviation: 'TST', type: 'superior', state: 'DF', city: 'Brasília' },
  { code: '9.03', name: 'Tribunal Superior Eleitoral', abbreviation: 'TSE', type: 'superior', state: 'DF', city: 'Brasília' },
  { code: '9.04', name: 'Superior Tribunal Militar', abbreviation: 'STM', type: 'superior', state: 'DF', city: 'Brasília' }
];

async function runSeed() {
  console.log("Apagando registros antigos (se houver)...");
  await db.delete(courts);
  console.log("Semeando courts (Tribunais)...");
  await db.insert(courts).values(seedData);
  console.log("Finalizado.");
  process.exit(0);
}

runSeed().catch(e => {
  console.error(e);
  process.exit(1);
});
