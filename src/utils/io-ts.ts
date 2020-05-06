import * as t from "io-ts";

/* 
https://github.com/gcanti/io-ts/pull/266#issuecomment-474935329

Although the maintainer of io-ts doesn't like this, I think it's helping a lot in my case.
Beware of the following behavior though

    const Person = t.interface({
    name: t.string,
    age: optional(t.number)
    })

    Person.decode({name: 'bob'}) // returns right({name: 'bob'})
    Person.is({name: 'bob'}) // returns false
 */
export const optional = <T extends t.Type<any, any, any>>(type: T) =>
  t.union([type, t.null, t.undefined]);
