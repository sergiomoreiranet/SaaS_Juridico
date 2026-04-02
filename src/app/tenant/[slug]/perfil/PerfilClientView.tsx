"use client";

import { useState, useRef, useTransition } from "react";
import { Camera, User, Lock, Mail, Shield, Save } from "lucide-react";
import { uploadUserAvatar, updateUserProfileInfo } from "@/actions/user-actions";
import { toast } from "sonner"; // Requer <Toaster /> no root layout
import { useSession } from "next-auth/react";

export function PerfilClientView({ user }: { user: any }) {
  const { update } = useSession();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [previewImage, setPreviewImage] = useState<string | null>(user?.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSavingTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleCickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleUploadToServer = () => {
    if (!selectedFile) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("avatar", selectedFile);
      
      const res = await uploadUserAvatar(formData);
      
      if (res?.success) {
        toast.success("Foto atualizada com sucesso!");
        setSelectedFile(null); // Reseta estado de arquivo novo
        // Atualiza a sessão silenciosamente no navegador (força Refresh na image)
        await update({ image: res.url });
      } else {
        toast.error(res?.error || "Erro ao fazer upload");
      }
    });
  };

  const handleSaveInfo = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Nome e E-mail são obrigatórios.");
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    startSavingTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      const res = await updateUserProfileInfo(formData);
      
      if (res?.success) {
        toast.success("Dados atualizados com sucesso!");
        setPassword("");
        setConfirmPassword("");
        await update({ name, email });
      } else {
        toast.error(res?.error || "Erro ao atualizar dados.");
      }
    });
  };

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
    : "?";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-[#f5f5f5] tracking-tight">Meu Perfil</h1>
        <p className="text-[13px] text-zinc-400 mt-1">Gerencie suas informações pessoais e opções de segurança.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Coluna da Esquerda (Foto) */}
        <div className="col-span-1 space-y-6">
          <div className="rounded-2xl border border-[#cca77b]/35 bg-[#121212] p-7 shadow-lg relative flex flex-col items-center justify-center text-center">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#cca77b]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
             
             <div className="relative group cursor-pointer mb-5" onClick={handleCickUpload}>
               <div className="w-28 h-28 rounded-full bg-[#181818] border-2 border-[#cca77b]/30 overflow-hidden flex items-center justify-center shadow-inner relative z-10 transition-all">
                 {isPending ? (
                   <div className="w-6 h-6 border-2 border-transparent border-t-[#cca77b] rounded-full animate-spin"></div>
                 ) : previewImage ? (
                   <img src={previewImage} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-3xl font-bold text-[#cca77b]">{initials}</span>
                 )}
               </div>
               
               {/* Overlay Hover */}
               <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all border border-[#cca77b]/50 z-20">
                 <Camera className="w-6 h-6 text-white mb-1" />
                 <span className="text-[10px] uppercase font-bold text-white tracking-widest">Alterar</span>
               </div>
             </div>
             
             <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

             <h2 className="text-lg font-medium text-[#f5f5f5]">{user?.name || "Usuário"}</h2>
             <p className="text-[13px] text-[#cca77b] mt-0.5 capitalize">{user?.role || "Membro"}</p>
             
             <div className="w-full h-px bg-white/5 my-6" />

             <button 
               onClick={handleUploadToServer} 
               disabled={!selectedFile || isPending}
               className="w-full py-2.5 rounded-xl border border-white/5 bg-[#141414] hover:bg-[#1a1a1a] hover:border-[#cca77b]/30 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 relative z-10"
             >
               {isPending ? "Salvando..." : selectedFile ? "Confirmar Upload" : "Selecione uma Imagem"}
             </button>
             <p className="text-[10px] text-zinc-500 mt-3 max-w-[200px] leading-relaxed mx-auto">
               Recomendado 500x500px em JPG ou PNG. Tamanho máximo de 2MB.
             </p>
          </div>
        </div>

        {/* Coluna da Direita (Dados) */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#cca77b]/35 bg-[#121212] p-7 shadow-lg relative">
            <h3 className="text-base font-medium text-[#f5f5f5] mb-6 flex items-center gap-2 relative z-10">
              <User className="w-[18px] h-[18px] text-[#cca77b]" />
              Informações Pessoais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 relative z-10">
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-zinc-400">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/5 rounded-xl text-sm text-zinc-300 outline-none focus:border-[#cca77b]/50 focus:bg-[#1a1a1a] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-medium text-zinc-400">Endereço de E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/5 rounded-xl text-sm text-zinc-300 outline-none focus:border-[#cca77b]/50 focus:bg-[#1a1a1a] transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-zinc-400">Cargo de Acesso</label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={user?.role || "Membro"}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-white/5 rounded-xl text-sm text-zinc-500 outline-none cursor-not-allowed capitalize"
                  />
                </div>
                <p className="text-[10px] text-zinc-600">Apenas administradores podem mudar o cargo.</p>
              </div>
            </div>

            <h3 className="text-base font-medium text-[#f5f5f5] mb-6 pt-6 border-t border-white/5 flex items-center gap-2 relative z-10">
              <Lock className="w-[18px] h-[18px] text-[#cca77b]" />
              Segurança e Senha
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 relative z-10">
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-zinc-400">Nova Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Deixe em branco para manter"
                  className="w-full px-4 py-2.5 bg-[#181818] border border-white/5 rounded-xl text-sm text-zinc-300 outline-none focus:border-[#cca77b]/50 focus:bg-[#1a1a1a] transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-medium text-zinc-400">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 bg-[#181818] border border-white/5 rounded-xl text-sm text-zinc-300 outline-none focus:border-[#cca77b]/50 focus:bg-[#1a1a1a] transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-6 border-t border-white/5 relative z-10">
              <button 
                onClick={handleSaveInfo}
                disabled={isSaving}
                className="flex items-center gap-2 bg-gradient-to-r from-[#cca77b]/90 to-[#cca77b]/70 hover:from-[#cca77b] hover:to-[#cca77b]/90 text-[#121212] px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-[0_0_15px_rgba(204,167,123,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
