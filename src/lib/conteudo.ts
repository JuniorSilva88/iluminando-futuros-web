import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import img2 from '@/assets/oficial/img2-1200.jpg';
import img5 from '@/assets/oficial/img5-1200.jpg';
import img7 from '@/assets/oficial/img7-1200.jpg';
import cg from '@/assets/oficial/cgRefrigeracao.jpeg';
import artec from '@/assets/oficial/arTecRefrigeracao.jpeg';
import nei from '@/assets/oficial/neiDoVolei.jpeg';
import c2 from '@/assets/oficial/c2ar.jpeg';
import casa from '@/assets/oficial/casaDoFrentista.jpg';
const oficiais: Record<string,string> = {'oficial:img2':img2,'oficial:img5':img5,'oficial:img7':img7,'oficial:cg':cg,'oficial:artec':artec,'oficial:nei':nei,'oficial:c2':c2,'oficial:casa':casa};
export async function imagemConteudo(path: string) {
  if (!path) return '';
  if (oficiais[path]) return oficiais[path];
  const { data, error } = await supabase.storage.from('galeria').createSignedUrl(path, 28800);
  if (error) throw error;
  return data.signedUrl;
}
export async function uploadConteudo(file: File, pasta: string) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Selecione uma imagem JPG, PNG ou WebP.');
  if (file.size > 10*1024*1024) throw new Error('A imagem deve ter até 10 MB.');
  const path = `${pasta}/${crypto.randomUUID()}.${file.name.split('.').pop()?.toLowerCase() ?? 'jpg'}`;
  const { error } = await supabase.storage.from('galeria').upload(path,file,{contentType:file.type});
  if (error) throw new Error('Não foi possível enviar a imagem. Verifique sua conexão e permissão.');
  return path;
}
export const campanhasQuery = {queryKey:['campanhas'] as const, staleTime:60000, queryFn:async()=>{
  const {data,error}=await supabase.from('campanhas').select('*').order('ordem').order('created_at');
  if(error) throw error;
  return Promise.all((data??[]).map(async row=>({...row,url:await imagemConteudo(row.imagem)})));
}};
export const patrocinadoresQuery = {queryKey:['patrocinadores'] as const, staleTime:60000, queryFn:async()=>{
  const {data,error}=await supabase.from('patrocinadores').select('*').order('ordem').order('created_at');
  if(error) throw error;
  return Promise.all((data??[]).map(async row=>({...row,url:await imagemConteudo(row.logo)})));
}};
export function useConteudo() {
  const queryClient=useQueryClient();
  const campanhas=useQuery(campanhasQuery);
  const patrocinadores=useQuery(patrocinadoresQuery);
  useEffect(()=>{
    const channel=supabase.channel('conteudo-site').on('postgres_changes',{event:'*',schema:'public',table:'campanhas'},()=>queryClient.invalidateQueries({queryKey:campanhasQuery.queryKey})).on('postgres_changes',{event:'*',schema:'public',table:'patrocinadores'},()=>queryClient.invalidateQueries({queryKey:patrocinadoresQuery.queryKey})).subscribe();
    return ()=>{supabase.removeChannel(channel);};
  },[queryClient]);
  return {campanhas,patrocinadores};
}
export function siteSeguro(value:string) { try {const url=new URL(value); return ['https:','http:'].includes(url.protocol)?url.href:undefined;} catch {return undefined;} }
