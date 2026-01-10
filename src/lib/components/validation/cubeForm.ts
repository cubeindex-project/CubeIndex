import z from "zod/v4";
import { normalizeHostname } from "$lib/components/helper_functions/vendorHosts";

export const releaseDatePattern = /^\d{4}-\d{2}-\d{2}$/;
export const sizePattern =
	/^[0-9]+(\.[0-9]+)?\sx\s[0-9]+(\.[0-9]+)?\sx\s[0-9]+(\.[0-9]+)?$/;

const defaultFeatures = {
	wcaLegal: false,
	magnetic: false,
	smart: false,
	modded: false,
	maglev: false,
	stickered: false,
	ballCore: false,
};

const featuresSchema = z
	.object({
		wcaLegal: z.coerce.boolean().default(false),
		magnetic: z.coerce.boolean().default(false),
		smart: z.coerce.boolean().default(false),
		modded: z.coerce.boolean().default(false),
		maglev: z.coerce.boolean().default(false),
		stickered: z.coerce.boolean().default(false),
		ballCore: z.coerce.boolean().default(false),
	})
	.default(defaultFeatures)
	.check((data) => {
		if (data.value.smart && data.value.wcaLegal) {
			data.issues.push({
				code: "custom",
				message: "Smart cubes can not be WCA Legal",
				input: data.value.wcaLegal,
				path: ["wcaLegal"],
			});
		}
	});

const vendorLinksSchema = z
	.array(
		z.object({
			vendor_name: z.string().trim().min(1, "Vendor name is required"),
			url: z.url("Must be a valid URL").trim(),
			price: z.coerce.number().min(0, "Price must be >= 0"),
			available: z.coerce.boolean().default(false),
		}),
	)
	.default([]);

const imageUrlSchema = (allowedHostnames: Set<string>) =>
	z
		.string()
		.url("Image URL must be valid")
		.refine((value) => {
			const hostname = normalizeHostname(value);
			if (!hostname || allowedHostnames.size === 0) return false;

			for (const allowed of allowedHostnames) {
				if (hostname === allowed || hostname.endsWith(`.${allowed}`)) {
					return true;
				}
			}

			return false;
		}, {
			message:
				allowedHostnames.size > 0
					? "Image URL must use a known vendor host"
					: "Image URL hostnames are not configured",
		});

export function createCubeSchema(allowedImageHostnames: readonly string[]) {
	const normalizedHosts = new Set(
		allowedImageHostnames
			.map((host) => normalizeHostname(host))
			.filter((host): host is string => Boolean(host)),
	);

	return z
		.object({
			id: z.number().int().nonnegative().optional(),
			series: z.string().trim().optional(),
			model: z.string().trim().min(1, "Model is required"),
			versionType: z.enum(["Base", "Trim", "Limited"]),
			versionName: z.string().trim().optional(),
			brand: z.string().trim().min(1, "Brand is required"),
			otherBrand: z.string().trim().default(""),
			type: z.string().trim().min(1, "Type is required"),
			otherType: z.string().trim().default(""),
			sub_type: z.string().trim().min(1, "Sub Type is required").default("auto"),
			relatedTo: z.string().trim().optional(),
			releaseDate: z
				.string()
				.trim()
				.min(1, "Release date is required")
				.refine((val) => releaseDatePattern.test(val), {
					message: "Release date must be YYYY-MM-DD",
				}),
			imageUrl: imageUrlSchema(normalizedHosts),
			surfaceFinish: z.string().trim().min(1, "Surface finish is required"),
			weight: z.coerce.number().min(0, "Weight must be >= 0"),
			size: z.coerce
				.string()
				.trim()
				.refine((val) => sizePattern.test(val), {
					message: "Size must be num x num x num",
				}),
			discontinued: z.coerce.boolean().default(false),
			features: featuresSchema,
			vendorLinks: vendorLinksSchema,
		})
		.check((data) => {
			if (
				data.value.versionType !== "Base" &&
				(!data.value.versionName || data.value.versionName.trim().length === 0)
			) {
				data.issues.push({
					code: "custom",
					message:
						"The version name is required when the cube type is not Base",
					input: data.value.versionName,
					path: ["versionName"],
				});
			}

			if (
				data.value.brand === "___other" &&
				(!data.value.otherBrand || data.value.otherBrand.trim().length === 0)
			) {
				data.issues.push({
					code: "custom",
					message: "Brand is required",
					input: data.value.otherBrand,
					path: ["otherBrand"],
				});
			}

			if (
				data.value.type === "___other" &&
				(!data.value.otherType || data.value.otherType.trim().length === 0)
			) {
				data.issues.push({
					code: "custom",
					message: "A Type is required",
					input: data.value.otherType,
					path: ["otherType"],
				});
			}
		});
}
