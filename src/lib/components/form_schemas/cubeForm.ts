import z from "zod/v4";

export const cubeSchema = z
  .object({
    id: z.number(),
    series: z.string().optional(),
    model: z.string().nonempty("Model is required"),
    versionType: z.literal(["Base", "Trim", "Limited"]),
    versionName: z.string().optional(),
    brand: z.string().nonempty("Brand is required"),
    otherBrand: z.string(),
    type: z.string().nonempty("Type is required"),
    otherType: z.string(),
    sub_type: z.string().nonempty("Sub Type is required"),
    relatedTo: z.string().optional(),
    releaseDate: z
      .string()
      .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
        error: "Release date must be YYYY-MM-DD",
      }),
    imageUrl: z.url("Image URL must be valid"),
    surfaceFinish: z.string().optional(),
    weight: z.coerce.number().min(0, "Weight must be ≥ 0"),
    size: z.coerce
      .string()
      .refine((val) => /[0-9]+\sx\s[0-9]+\sx\s[0-9]+/.test(val), {
        error: "Size must be num x num x num",
      }),
    discontinued: z.boolean(),
    features: z
      .object({
        wcaLegal: z.boolean(),
        magnetic: z.boolean(),
        smart: z.boolean(),
        modded: z.boolean(),
        maglev: z.boolean(),
        stickered: z.boolean(),
        ballCore: z.boolean(),
      })
      .check((data) => {
        if (data.value.smart === true && data.value.wcaLegal === true) {
          data.issues.push({
            code: "custom",
            message: "Smart cubes can not be WCA Legal",
            input: data.value.wcaLegal,
            path: ["wcaLegal"],
          });
        }
      }),
    vendorLinks: z.array(
      z.object({
        vendor_name: z.string().nonempty("Vendor name is required"),
        url: z.url("Must be a valid URL"),
        price: z.coerce.number().min(0, "Price must be ≥ 0"),
        available: z.boolean(),
      })
    ),
  })
  // enforce versionName when versionType !== 'Base'
  .check((data) => {
    if (
      data.value.versionType !== "Base" &&
      ((data.value.versionName && data.value.versionName.trim() === "") ||
        !data.value.versionName)
    ) {
      data.issues.push({
        code: "custom",
        message: "The version name is required when the cube type is not Base",
        input: data.value.versionName,
        path: ["versionName"],
      });
    }

    if (data.value.brand === "___other" && !data.value.otherBrand) {
      data.issues.push({
        code: "custom",
        message: "Brand is required",
        input: data.value.otherBrand,
        path: ["otherBrand"],
      });
    }

    if (data.value.type === "___other" && !data.value.otherType) {
      data.issues.push({
        code: "custom",
        message: "A Type is required",
        input: data.value.otherType,
        path: ["otherType"],
      });
    }
  });
