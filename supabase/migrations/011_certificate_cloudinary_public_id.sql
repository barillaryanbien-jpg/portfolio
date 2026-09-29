-- Preserve Cloudinary asset identity alongside its public delivery URL.
-- The existing certificate_image_path column remains the URL source used by the UI.

alter table public.certificates
  add column if not exists certificate_image_public_id text;

alter table public.certificates
  drop constraint if exists certificates_image_public_id_length;

alter table public.certificates
  add constraint certificates_image_public_id_length
  check (
    certificate_image_public_id is null
    or length(trim(certificate_image_public_id)) between 1 and 255
  );
