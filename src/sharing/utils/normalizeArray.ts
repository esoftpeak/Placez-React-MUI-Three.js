import { PrimaryCategory } from "../../api";
import { Catalog } from "../../models";
import { CATEGORY, CATALOG_NAME } from "../../reducers/asset";

export function normalizeArray<T>(array: T[], indexKey: keyof T) {
  const normalizedObject: any = {};
  for (let i = 0; i < array.length; i++) {
    const key = array[i][indexKey];
    normalizedObject[key] = array[i];
  }
  return normalizedObject as { [key: string]: T };
}

export function groupBy<T>(list: T[], key: keyof T): Map<T[keyof T], T[]> {
  return list.reduce((accumulator, currentValue) => {
    // Get the value of the key for the current object
    const keyValue = currentValue[key];
    // Get the existing group for this key value, or initialize a new one
    const group = accumulator.get(keyValue) || [];
    accumulator.set(keyValue, [...group, currentValue]);
    return accumulator;
  }, new Map<T[keyof T], T[]>());
}

function normalizeName(name: string): string {
  return name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function handleEventCategory(category: PrimaryCategory): PrimaryCategory {
  return {
    ...category,
    subCategories: category.subCategories.filter(
      (item) => normalizeName(item.name) !== normalizeName(CATEGORY.TENTS)
    ),
  };
}

function handleAVCategory(category: PrimaryCategory): PrimaryCategory {
  return { ...category, name: CATEGORY.AUDIO_VISUALS };
}

function handleDecorCategory(
  category: PrimaryCategory,
  categoriesMap: Map<string, PrimaryCategory>
): PrimaryCategory {
  const wallDecorCategory = categoriesMap.get(normalizeName(CATEGORY.WALL_DECOR));

  const balloonsItemsSkus =
    category.subCategories
      .find((subCat) => normalizeName(subCat.name) === normalizeName(CATEGORY.BALLOONS))
      ?.itemSkus?.map((sku) => sku.sku) || [];

  const updatedSubCategories = category.subCategories.map((subCat) => {
    if (normalizeName(subCat.name) === normalizeName(CATEGORY.PROPS)) {
      return {
        ...subCat,
        itemSkus: subCat.itemSkus.filter(
          (sku) => !balloonsItemsSkus.includes(sku.sku)
        ),
      };
    }
    return subCat;
  });

  return {
    ...category,
    subCategories: wallDecorCategory
      ? [...updatedSubCategories, ...wallDecorCategory.subCategories]
      : category.subCategories,
  };
}

function handleKitchenCategory(category: PrimaryCategory): PrimaryCategory {
  const racksSubCat = category.subCategories.find(
    (subCat) => normalizeName(subCat.name) === normalizeName(CATEGORY.RACKS)
  );
  const servingSubCat = category.subCategories.find(
    (subCat) => normalizeName(subCat.name) === normalizeName(CATEGORY.SERVING)
  );

  const mergedStorageSubCat = {
    ...racksSubCat,
    name: CATEGORY.STORAGE,
    itemSkus: [
      ...(racksSubCat?.itemSkus || []),
      ...(servingSubCat?.itemSkus || []),
    ],
  };

  return {
    ...category,
    subCategories: [
      mergedStorageSubCat,
      ...category.subCategories.filter(
        (subCat) =>
          ![CATEGORY.RACKS, CATEGORY.SERVING]
            .map(normalizeName)
            .includes(normalizeName(subCat.name))
      ),
    ],
  };
}

export function catalogConsolidation(catalogsObj: {
  [key: string]: Catalog;
}): { [key: string]: Catalog } {
  const consolidatedCatalogs: { [key: string]: Catalog } = {};

  Object.entries(catalogsObj).forEach(([key, catalog]) => {
    if (catalog.name !== CATALOG_NAME) {
      consolidatedCatalogs[key] = {
        ...catalog,
        categories: catalog.categories.map((cateogry)=>{
          return {
            ...cateogry,
            subCategories: cateogry.subCategories.filter((subCat)=> !!subCat.itemSkus.length)
          }
        })
      };
      return;
    }

    const categoriesMap = new Map(
      catalog.categories.map((cat) => [normalizeName(cat.name), cat])
    );

    const newCategories = catalog.categories.reduce(
      (acc: PrimaryCategory[], category: PrimaryCategory) => {
        const normalizedName = normalizeName(category.name);

        switch (normalizedName) {
          case normalizeName(CATEGORY.EVENT):
            acc.push(handleEventCategory(category));
            break;

          case normalizeName(CATEGORY.AV):
            acc.push(handleAVCategory(category));
            break;

          case normalizeName(CATEGORY.WALL_DECOR):
            break;

          case normalizeName(CATEGORY.DECOR):
            acc.push(handleDecorCategory(category, categoriesMap));
            break;

          case normalizeName(CATEGORY.KITCHEN):
            acc.push(handleKitchenCategory(category));
            break;

          default:
            acc.push(category);
        }

        return acc;
      },
      []
    );

    consolidatedCatalogs[key] = { ...catalog, categories: newCategories };
  });

  return consolidatedCatalogs;
}

