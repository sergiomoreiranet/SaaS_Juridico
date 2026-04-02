import { db } from "../db";
import { professions } from "../db/schema";

const defaultProfessions = [
  "ADVOGADO(A)",
  "MÉDICO(A)",
  "ENGENHEIRO(A)",
  "PROFESSOR(A)",
  "COMERCIANTE",
  "EMPRESÁRIO(A)",
  "AUTÔNOMO(A)",
  "APOSENTADO(A)",
  "OUTROS",
  "ARQUITETO(A)",
  "ADMINISTRADOR(A)",
  "AGRICULTOR(A)",
  "ARTISTA",
  "ATOR/ATRIZ",
  "ANALISTA DE SISTEMAS",
  "BANCÁRIO(A)",
  "BIÓLOGO(A)",
  "CANTOR(A)",
  "CARPINTEIRO(A)",
  "CENÓGRAFO(A)",
  "CINEASTA",
  "COSTUREIRO(A)",
  "CONTADOR(A)",
  "COZINHEIRO(A)",
  "DENTISTA",
  "DESIGNER",
  "DESENHISTA",
  "ECONOMISTA",
  "ELETRICISTA",
  "ENCANADOR(A)",
  "ENFERMEIRO(A)",
  "ESTETICISTA",
  "ESTUDANTE",
  "FARMACÊUTICO(A)",
  "FÍSICO(A)",
  "FISIOTERAPEUTA",
  "FOTÓGRAFO(A)",
  "GARÇOM/GARÇONETE",
  "GEÓLOGO(A)",
  "JARDINEIRO(A)",
  "JORNALISTA",
  "JUÍZ(A)",
  "MARCENEIRO(A)",
  "MECÂNICO(A)",
  "MILITAR",
  "MOTORISTA",
  "MÚSICO(A)",
  "NUTRICIONISTA",
  "ODONTÓLOGO(A)",
  "PADEIRO(A)",
  "PESCADOR(A)",
  "POLICIAL",
  "PSICÓLOGO(A)",
  "PUBLICITÁRIO(A)",
  "RADIALISTA",
  "RECEPCIONISTA",
  "SECRETÁRIO(A)",
  "SEGURANÇA",
  "SOCIÓLOGO(A)",
  "TÉCNICO(A) DE INFORMÁTICA",
  "TÉCNICO(A) EM ENFERMAGEM",
  "TRABALHADOR(A) RURAL",
  "VETERINÁRIO(A)",
  "VENDEDOR(A)",
  "CABELEIREIRO(A)",
  "OPERADOR(A) DE MÁQUINA",
  "TÉCNICO(A) DE SISTEMA DE TRATAMENTO DE ÁGUA",
  "AJUDANTE GERAL",
  "DESEMPREGADO(A)",
  "LAVRADOR(A)",
  "FUNCIONÁRIO(A) PÚBLICO MUNICIPAL",
  "FUNCIONÁRIO(A) PÚBLICO ESTADUAL",
  "FUNCIONÁRIO(A) PÚBLICO FEDERAL",
  "CASEIRO(A)",
  "MICROEMPRESÁRIO(A)",
  "BRAÇAL",
  "FRENTISTA",
  "INSPETOR(A) DE ALUNOS",
  "PREPARADOR(A) DE MATÉRIA-PRIMA",
  "MERENDEIRO(A)",
  "LENHADOR(A)"
];

async function main() {
  console.log("Iniciando o seeding de profissões globais...");

  for (const prof of defaultProfessions) {
    await db.insert(professions).values({
      name: prof,
    });
    console.log(`Profissão adicionada: ${prof}`);
  }

  console.log("Seeding concluído com sucesso!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro no seeding:", err);
  process.exit(1);
});
