create or replace function public.reject_submission(
	p_submission_id bigint,
	p_reviewer_note text
)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
	v_reviewer_id uuid := auth.uid();
	v_submission public.submissions%rowtype;
begin
	if v_reviewer_id is null then
		raise exception 'Authentication required' using errcode = '42501';
	end if;

	if nullif(trim(p_reviewer_note), '') is null then
		raise exception 'A rejection reason is required' using errcode = '22023';
	end if;

	if not exists (
		select 1
		from public.profiles
		where user_id = v_reviewer_id
			and role in ('Admin'::public.users_roles, 'Database Manager'::public.users_roles)
	) then
		raise exception 'Database manager role required' using errcode = '42501';
	end if;

	select *
	into v_submission
	from public.submissions
	where id = p_submission_id
	for update;

	if not found then
		raise exception 'Submission % does not exist', p_submission_id using errcode = 'P0002';
	end if;

	if v_submission.status <> 'Pending'::public.submission_status then
		raise exception 'Only pending submissions can be rejected' using errcode = '22023';
	end if;

	update public.submissions
	set
		status = 'Rejected'::public.submission_status,
		reviewer_note = trim(p_reviewer_note),
		reviewed_by_id = v_reviewer_id,
		reviewed_at = now()
	where id = p_submission_id;
end;
$function$;

revoke all on function public.reject_submission(bigint, text) from public;
grant execute on function public.reject_submission(bigint, text) to authenticated;
