CREATE UNIQUE INDEX cube_submission_id_vendor_id_unique ON public.cube_vendor_link_submissions USING btree (cube_submission_id, vendor_id);

alter table "public"."cube_vendor_link_submissions" add constraint "cube_submission_id_vendor_id_unique" UNIQUE using index "cube_submission_id_vendor_id_unique";
