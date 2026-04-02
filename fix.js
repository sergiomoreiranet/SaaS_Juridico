const fs = require('fs');

const NEW_GOLD = '#c4a67e'; // Tom de dourado sofisticado e pálido (champagne beige) baseado na imagem original.
const OLD_GOLD = '#d4af37';

const files = [
  'src/components/layout/sidebar.tsx',
  'src/components/layout/topbar.tsx',
  'src/app/tenant/[slug]/DashboardClientView.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Substitui o amarelo-ouro forte para a nova cor
    content = content.replace(new RegExp(OLD_GOLD, 'g'), NEW_GOLD);
    
    if (file.includes('sidebar.tsx')) {
       // Remove a bolinha irritante e clareia o fundo hover
       content = content.replace('{isActive && <div className="ml-auto w-1 h-1 rounded-full bg-[#c4a67e] shadow-[0_0_8px_#c4a67e]" />}', '');
       content = content.replace('bg-gradient-to-r from-[#c4a67e]/20 to-[#c4a67e]/0 text-[#c4a67e] border border-[#c4a67e]/10', 'bg-gradient-to-r from-[#c4a67e]/15 to-transparent text-[#c4a67e] border border-transparent');
    }

    if (file.includes('DashboardClientView.tsx')) {
       // Bordas das janelas mais suaves, em branco sutil, em vez de amarelas sólidas
       content = content.replace(/border-\[\#c4a67e\]\/30/g, 'border-[#c4a67e]/10'); 
       content = content.replace(/border-\[\#c4a67e\]\/50/g, 'border-[#c4a67e]/20');
    }
    
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
