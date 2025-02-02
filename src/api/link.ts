type linkHeaderT = {
  next?: { url: string; results: boolean };
  previous?: { url: string; results: boolean };
};
const re = /<(.*?)>;[\s]*rel="([a-z]+)";[\s]*results="(true|false)";/g;

const linkParser = (linkHeader: string | null): linkHeaderT => {
  if (!linkHeader) {
    return {};
  }
  let obj: linkHeaderT = {};
  let arrRes: RegExpExecArray | null = null;
  while ((arrRes = re.exec(linkHeader)) !== null) {
    if (arrRes[2] === "next") {
      obj.next = {
        url: arrRes[1],
        results: arrRes[3] === "true",
      };
    }
    if (arrRes[2] === "previous") {
      obj.previous = {
        url: arrRes[1],
        results: arrRes[3] === "true",
      };
    }
  }
  return obj;
};

export const getNextPage = (linkHeader: string | null): string | null => {
  if (!linkHeader) {
    return null;
  }
  const parsed = linkParser(linkHeader);
  if (!parsed.next) {
    return null;
  }
  if (!parsed.next.results) {
    return null;
  }
  if (!parsed.next.url) {
    return null;
  }
  return parsed.next.url;
};
