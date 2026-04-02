const fs = require('fs');

const NEW_GOLD = '#cca77b'; // Um tom um pouquinho mais vivo, para dar o contraste da borda original
const OLD_GOLD = '#c4a67e';

const files = [
  'src/components/layout/sidebar.tsx',
  'src/components/layout/topbar.tsx',
  'src/app/tenant/[slug]/DashboardClientView.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Troca o hex global
    content = content.replace(new RegExp(OLD_GOLD, 'g'), NEW_GOLD);
    
    // ----------- SIDEBAR -----------
    if (file.includes('sidebar.tsx')) {
       // Aumenta a forca do gradiente para ficar igual a foto (from-20% para algo como from-30% ou 40%)
       content = content.replace(
         'bg-gradient-to-r from-['+NEW_GOLD+']/15 to-transparent text-['+NEW_GOLD+'] border border-transparent', 
         'bg-gradient-to-r from-['+NEW_GOLD+']/35 to-transparent text-['+NEW_GOLD+']'
       );
    }

    // ----------- DASHBOARD -----------
    if (file.includes('DashboardClientView.tsx')) {
       // A imagem orignal tem bordas bem delimitadas e finas. "#10" de opacidade as escondeu no fundo escuro.
       // Vamos aumentar a opacidade das bordas de 10%/20% para 30%/40%. E a row ativa para 40%.
       
       // Bordas dos Cards principais
       content = content.replace(/border /g, 'border '); // dummy
       
       // As bordas estavam com border-[#cca77b]/10.
       content = content.replace(/border-\[\#cca77b\]\/10/g, 'border-[#cca77b]/35');
       content = content.replace(/border-\[\#cca77b\]\/20/g, 'border-[#cca77b]/50');

       // A linha ativa "Case Name 2" do "Recent Matters"
       // De border border-[#cca77b]/10, mudei para /35, então o script ali em cima já trocou.
       // Mas o gradiente da linha ativa tava fraco: from-[#cca77b]/20 to-[#cca77b]/5...
       content = content.replace(
         'bg-gradient-to-r from-['+NEW_GOLD+']/20 to-['+NEW_GOLD+']/5',
         'bg-gradient-to-r from-['+NEW_GOLD+']/30 via-['+NEW_GOLD+']/5 to-transparent'
       );
    }
    
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
