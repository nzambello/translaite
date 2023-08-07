import type { User, Translation } from "@prisma/client";

import { prisma } from "~/db.server";

export function getTranslation({
  id,
  userId,
}: Pick<Translation, "id"> & {
  userId: User["id"];
}) {
  return prisma.translation.findFirst({
    where: { id, userId },
  });
}

export function getTranslationsListItems({ userId }: { userId: User["id"] }) {
  return prisma.translation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export function createTranslation({
  lang,
  text,
  result,
  userId,
}: Pick<Translation, "lang" | "text" | "result"> & {
  userId: User["id"];
}) {
  return prisma.translation.create({
    data: {
      lang,
      text,
      result,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteTranslation({
  id,
  userId,
}: Pick<Translation, "id"> & { userId: User["id"] }) {
  return prisma.translation.deleteMany({
    where: { id, userId },
  });
}
