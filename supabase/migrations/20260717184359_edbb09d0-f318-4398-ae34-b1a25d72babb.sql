
CREATE POLICY "Obras: autor lê seu arquivo"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'obras' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Obras: autor envia seu arquivo"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'obras' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Obras: autor atualiza seu arquivo"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'obras' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Obras: autor remove seu arquivo"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'obras' AND auth.uid()::text = (storage.foldername(name))[1]);
