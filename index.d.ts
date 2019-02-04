/* tslint:disable:member-ordering null array-type null unified-signatures */
// Type definitions for bookshelf v0.9.4
// Project: http://bookshelfjs.org/
// Definitions by: Piotr Mionskowski <https://github.com/miensol> based on Andrew Schurman <https://github.com/arcticwaters>, Vesa Poikajärvi <https://github.com/vesse>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.3

import Knex from 'knex';
import BlueBird from 'bluebird';
import Lodash = require('lodash');
import createError = require('create-error');

declare function Bookshelf(knex: Knex): Bookshelf.Main;

declare namespace Bookshelf {
    type SortOrder = 'ASC' | 'asc' | 'DESC' | 'desc';

    interface Main extends Events {
        VERSION: string;
        knex: Knex;
        Model: typeof Model;
        Collection: typeof Collection;

        plugin(name: string | string[] | (() => void), options?: any): this;

        transaction<T>(callback: (transaction: Knex.Transaction) => PromiseLike<T>): BlueBird<T>;
    }

    abstract class Events {
        on(event?: string, callback?: EventFunction<this>, context?: any): void;

        off(event?: string): void;

        trigger(event?: string, ...args: any[]): void;

        triggerThen(name: string, ...args: any[]): BlueBird<any>;

        once(event: string, callback: EventFunction<this>, context?: any): void;
    }

    // interface IModelBase {
    //     /** Should be exportd as a getter instead of a plain property. */
    //     hasTimestamps?: boolean | string[];
    //     /** Should be exportd as a getter instead of a plain property. Should be required, but cannot have abstract properties yet. */
    //     tableName?: string;
    // }

    // interface ModelBase<T extends Model> extends IModelBase {
    // }

    type UnpackModelOrCollection<T> = T extends (...args: any[]) => any
        ? (ReturnType<T> extends Model | Collection<infer R> ? ReturnType<T> : never)
        : T extends Model | Collection<infer R> ? T : never

    type KeysOfType<T, Condition> = {
        [Key in keyof T]: T[Key] extends Condition ? Key : never
    }[keyof T]

    type ModelOrCollectionProps<T> = Exclude<KeysOfType<T, () => Model> | KeysOfType<T, () => Collection<any>>, keyof Model>


    type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];

    abstract class ModelBase extends Events {
        /** If overriding, must use a getter instead of a plain property. */
        idAttribute: string;

        abstract readonly tableName: string;

        abstract readonly hasTimestamps: boolean | string [];

        // See https://github.com/tgriesser/bookshelf/blob/0.9.4/src/base/model.js#L178
        // See https://github.com/tgriesser/bookshelf/blob/0.9.4/src/base/model.js#L213
        id: any;

        // See https://github.com/tgriesser/bookshelf/blob/0.9.4/src/base/model.js#L28
        attributes: any;

        constructor(attributes?: any, options?: ModelOptions);

        clear(): this;

        clone(): this;

        escape(attribute: string): string;

        format(attributes: any): any;

        get(attribute: string): any;

        has(attribute: string): boolean;

        hasChanged(attribute?: string): boolean;

        isNew(): boolean;

        parse(response: any): any;

        previousAttributes(): any;

        previous(attribute: string): any;

        // related<TRelationName extends ModelOrCollectionProps<this>>(relation: TRelationName): UnpackModelOrCollection<this[TRelationName]>
        related<TRelationName extends FunctionPropertyNames<this>>(relation: TRelationName): this[TRelationName] extends (...args: any[]) => any ? ReturnType<this[TRelationName]> : this[TRelationName]

        serialize(options?: SerializeOptions): any;

        set(attribute?: { [key: string]: any }, options?: SetOptions): this;
        set(attribute: string, value?: any, options?: SetOptions): this;

        timestamp(options?: TimestampOptions): any;

        toJSON(options?: SerializeOptions): any;

        unset(attribute: string): this;

        // lodash methods
        invert<R extends {}>(): R;

        keys(): string[];

        omit<R extends {}>(predicate?: Lodash.ObjectIterator<any, boolean>, thisArg?: any): R;
        omit<R extends {}>(...attributes: string[]): R;

        pairs(): any[][];

        pick<R extends {}>(predicate?: Lodash.ObjectIterator<any, boolean>, thisArg?: any): R;
        pick<R extends {}>(...attributes: string[]): R;

        values(): any[];
    }

    interface ModelSubclass<T extends Model = Model> {
        new(attributes?: any, options?: ModelOptions): T;
    }

    type Omit<T, K extends keyof T> = {
        [P in Exclude<keyof T, K>]: T[P];
    };

    abstract class Model extends ModelBase {
        constructor(attributes?: any, options?: ModelOptions);

        static collection<T extends Model>(models?: T[], options?: CollectionOptions<T>): Collection<T>;

        static count(column?: string, options?: SyncOptions): BlueBird<number>;

        /** @deprecated use Typescript classes */
        static extend<T extends Model>(prototypeProperties?: any, classProperties?: any): ModelSubclass<T>; // should return a type
        static fetchAll<T extends Model>(): BlueBird<Collection<T>>;

        /** @deprecated should use `new` objects instead. */
        static forge<T>(attributes?: any, options?: ModelOptions): T;

        static where<T extends Model>(properties: { [key: string]: any }): T;
        static where<T extends Model>(key: string, operatorOrValue: string | number | boolean, valueIfOperator?: string | string[] | number | number[] | boolean): T;

        belongsTo<R extends Model>(target: ModelSubclass<R>, foreignKey?: string, foreignKeyTarget?: string): R;

        belongsToMany<R extends Model>(target: ModelSubclass<R>, table?: string, foreignKey?: string, otherKey?: string, foreignKeyTarget?: string, otherKeyTarget?: string): Collection<R>;

        count(column?: string, options?: SyncOptions): BlueBird<number>;

        destroy(options?: DestroyOptions): BlueBird<this>;

        fetch(options?: FetchOptions & { require?: false }): BlueBird<this | null>;
        fetch(options: FetchOptions & { require: true }): BlueBird<this>;

        fetchAll(options?: FetchAllOptions): BlueBird<Collection<this>>;

        hasMany<R extends Model>(target: ModelSubclass<R>, foreignKey?: string, foreignKeyTarget?: string): Collection<R>;

        hasOne<R extends Model>(target: ModelSubclass<R>, foreignKey?: string, foreignKeyTarget?: string): R;

        load(relations: string | string[], options?: LoadOptions): BlueBird<this>;

        morphMany<R extends Model>(target: ModelSubclass<R>, name?: string, columnNames?: string[], morphValue?: string): Collection<R>;

        morphOne<R extends Model>(target: ModelSubclass<R>, name?: string, columnNames?: string[], morphValue?: string): R;

        morphTo(name: string, columnNames?: string[], ...target: ModelSubclass[]): this;
        morphTo(name: string, ...target: ModelSubclass[]): this;

        orderBy(column: string, order?: SortOrder): this;

        // Declaration order matters otherwise TypeScript gets confused between query() and query(...query: string[])
        query(): Knex.QueryBuilder;
        query(callback: (qb: Knex.QueryBuilder) => void): this;
        query(...query: string[]): this;
        // tslint:disable-next-line:unified-signatures
        query(query: { [key: string]: any }): this;

        refresh(options?: FetchOptions): BlueBird<this>;

        resetQuery(): this;

        save(key?: string, val?: any, options?: SaveOptions): BlueBird<this>;
        save(attrs?: { [key: string]: any }, options?: SaveOptions): BlueBird<this>;

        through<R extends Model>(interim: ModelSubclass<R>, throughForeignKey?: string, otherKey?: string): R;

        where(properties: { [key: string]: any }): this;
        where(key: string, operatorOrValue: string | number | boolean, valueIfOperator?: string | string[] | number | number[] | boolean): this;

        // See https://github.com/tgriesser/bookshelf/blob/0.9.4/src/errors.js
        // See https://github.com/tgriesser/bookshelf/blob/0.9.4/src/model.js#L1280
        static NotFoundError: createError.Error<Error>;
        static NoRowsUpdatedError: createError.Error<Error>;
        static NoRowsDeletedError: createError.Error<Error>;
    }

    abstract class CollectionBase<T> extends Events {
        // See https://github.com/tgriesser/bookshelf/blob/0.9.4/src/base/collection.js#L573
        length: number;

        // See https://github.com/tgriesser/bookshelf/blob/0.9.4/src/base/collection.js#L21
        constructor(models?: T[], options?: CollectionOptions<T>);

        add(models: T[] | { [key: string]: any }[], options?: CollectionAddOptions): Collection<T>;

        at(index: number): T;

        clone(): Collection<T>;

        fetch(options?: CollectionFetchOptions): BlueBird<Collection<T>>;

        findWhere(match: { [key: string]: any }): T;

        get(id: any): T;

        invokeThen(name: string, ...args: any[]): BlueBird<any>;

        parse(response: any): any;

        pluck(attribute: string): any[];

        pop(): void;

        push(model: any): Collection<T>;

        reduceThen<R>(iterator: (prev: R, cur: T, idx: number, array: T[]) => R, initialValue: R, context: any): BlueBird<R>;

        remove(model: T, options?: EventOptions): T;
        remove(model: T[], options?: EventOptions): T[];

        reset(model: any[], options?: CollectionAddOptions): T[];

        serialize(options?: SerializeOptions): any[];

        set(models: T[] | { [key: string]: any }[], options?: CollectionSetOptions): Collection<T>;

        shift(options?: EventOptions): void;

        slice(begin?: number, end?: number): void;

        toJSON(options?: SerializeOptions): any[];

        unshift(model: any, options?: CollectionAddOptions): void;

        where(match: { [key: string]: any }, firstOnly: true): T | null;
        where(match: { [key: string]: any }, firstOnly: false): Collection<T>;

        // lodash methods
        all(predicate?: Lodash.ListIterator<T, boolean> | Lodash.DictionaryIterator<T, boolean> | string, thisArg?: any): boolean;
        all<R extends {}>(predicate?: R): boolean;

        any(predicate?: Lodash.ListIterator<T, boolean> | Lodash.DictionaryIterator<T, boolean> | string, thisArg?: any): boolean;
        any<R extends {}>(predicate?: R): boolean;

        chain(): Lodash.LoDashExplicitObjectWrapper<T>;

        collect(predicate?: Lodash.ListIterator<T, boolean> | Lodash.DictionaryIterator<T, boolean> | string, thisArg?: any): T[];
        collect<R extends {}>(predicate?: R): T[];

        contains(value: any, fromIndex?: number): boolean;

        countBy(predicate?: Lodash.ListIterator<T, boolean> | Lodash.DictionaryIterator<T, boolean> | string, thisArg?: any): Lodash.Dictionary<number>;
        countBy<R extends {}>(predicate?: R): Lodash.Dictionary<number>;

        detect(predicate?: Lodash.ListIterator<T, boolean> | Lodash.DictionaryIterator<T, boolean> | string, thisArg?: any): T;
        detect<R extends {}>(predicate?: R): T;

        difference(...values: T[]): T[];

        drop(n?: number): T[];

        each(callback?: Lodash.ListIterator<T, void>, thisArg?: any): Lodash.List<T>;
        each(callback?: Lodash.DictionaryIterator<T, void>, thisArg?: any): Lodash.Dictionary<T>;
        each(callback?: Lodash.ObjectIterator<T, void>, thisArg?: any): T;

        every(predicate?: Lodash.ListIterator<T, boolean> | Lodash.DictionaryIterator<T, boolean> | string, thisArg?: any): boolean;
        every<R extends {}>(predicate?: R): boolean;

        filter(predicate?: Lodash.ListIterator<T, boolean> | Lodash.DictionaryIterator<T, boolean> | string, thisArg?: any): T[];
        filter<R extends {}>(predicate?: R): T[];

        find(predicate?: Lodash.ListIterator<T, boolean> | Lodash.DictionaryIterator<T, boolean> | string, thisArg?: any): T;
        find<R extends {}>(predicate?: R): T;

        first(): T;

        foldl<R>(callback?: Lodash.MemoIterator<T, R>, accumulator?: R, thisArg?: any): R;

        foldr<R>(callback?: Lodash.MemoIterator<T, R>, accumulator?: R, thisArg?: any): R;

        forEach(callback?: Lodash.ListIterator<T, void>, thisArg?: any): Lodash.List<T>;
        forEach(callback?: Lodash.DictionaryIterator<T, void>, thisArg?: any): Lodash.Dictionary<T>;
        forEach(callback?: Lodash.ObjectIterator<T, void>, thisArg?: any): T;

        groupBy(predicate?: Lodash.ListIterator<T, boolean> | Lodash.DictionaryIterator<T, boolean> | string, thisArg?: any): Lodash.Dictionary<T[]>;
        groupBy<R extends {}>(predicate?: R): Lodash.Dictionary<T[]>;

        head(): T;

        include(value: any, fromIndex?: number): boolean;

        indexOf(value: any, fromIndex?: number): number;

        initial(): T[];

        inject<R>(callback?: Lodash.MemoIterator<T, R>, accumulator?: R, thisArg?: any): R;

        invoke(methodName: string | (() => void), ...args: any[]): any;

        isEmpty(): boolean;

        keys(): string[];

        last(): T;

        lastIndexOf(value: any, fromIndex?: number): number;

        // See https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1ec3d51/lodash/lodash-3.10.d.ts#L7119
        // See https://github.com/Microsoft/TypeScript/blob/v1.8.10/lib/lib.core.es7.d.ts#L1122
        map<U>(predicate?: Lodash.ListIterator<T, U> | string, thisArg?: any): U[];
        map<U>(predicate?: Lodash.DictionaryIterator<T, U> | string, thisArg?: any): U[];
        map<U>(predicate?: string): U[];

        max(predicate?: Lodash.ListIterator<T, boolean> | string, thisArg?: any): T;
        max<R extends {}>(predicate?: R): T;

        min(predicate?: Lodash.ListIterator<T, boolean> | string, thisArg?: any): T;
        min<R extends {}>(predicate?: R): T;

        reduce<R>(callback?: Lodash.MemoIterator<T, R>, accumulator?: R, thisArg?: any): R;

        reduceRight<R>(callback?: Lodash.MemoIterator<T, R>, accumulator?: R, thisArg?: any): R;

        reject(predicate?: Lodash.ListIterator<T, boolean> | Lodash.DictionaryIterator<T, boolean> | string, thisArg?: any): T[];
        reject<R extends {}>(predicate?: R): T[];

        rest(): T[];

        select(predicate?: Lodash.ListIterator<T, boolean> | Lodash.DictionaryIterator<T, boolean> | string, thisArg?: any): T[];
        select<R extends {}>(predicate?: R): T[];

        shuffle(): T[];

        size(): number;

        some(predicate?: Lodash.ListIterator<T, boolean> | Lodash.DictionaryIterator<T, boolean> | string, thisArg?: any): boolean;
        some<R extends {}>(predicate?: R): boolean;

        sortBy(predicate?: Lodash.ListIterator<T, boolean> | Lodash.DictionaryIterator<T, boolean> | string, thisArg?: any): T[];
        sortBy<R extends {}>(predicate?: R): T[];

        tail(): T[];

        take(n?: number): T[];

        toArray(): T[];

        without(...values: any[]): T[];
    }

    class Collection<T> extends CollectionBase<T> {
        /** @deprecated use Typescript classes */
        static extend<T>(prototypeProperties?: any, classProperties?: any): ModelSubclass;

        /** @deprecated should use `new` objects instead. */
        static forge<T>(attributes?: any, options?: ModelOptions): T;

        attach(ids: any | any[], options?: SyncOptions): BlueBird<Collection<T>>;

        count(column?: string, options?: SyncOptions): BlueBird<number>;

        create(model: { [key: string]: any }, options?: CollectionCreateOptions): BlueBird<T>;

        detach(ids: any[], options?: SyncOptions): BlueBird<any>;
        detach(options?: SyncOptions): BlueBird<any>;

        fetchOne(options?: CollectionFetchOneOptions): BlueBird<T>;

        load(relations: string | string[], options?: SyncOptions): BlueBird<Collection<T>>;

        orderBy(column: string, order?: SortOrder): Collection<T>;

        // Declaration order matters otherwise TypeScript gets confused between query() and query(...query: string[])
        query(): Knex.QueryBuilder;
        query(callback: (qb: Knex.QueryBuilder) => void): Collection<T>;
        query(...query: string[]): Collection<T>;
        query(query: { [key: string]: any }): Collection<T>;

        resetQuery(): Collection<T>;

        through<R extends Model>(interim: ModelSubclass<R>, throughForeignKey?: string, otherKey?: string): Collection<R>;

        updatePivot(attributes: any, options?: PivotOptions): BlueBird<number>;

        withPivot(columns: string[]): Collection<T>;

        // See https://github.com/tgriesser/bookshelf/blob/0.9.4/src/collection.js#L389
        static EmptyError: createError.Error<Error>;
    }

    interface ModelOptions {
        tableName?: string;
        hasTimestamps?: boolean;
        parse?: boolean;
    }

    interface LoadOptions extends SyncOptions {
        withRelated: (string | WithRelatedQuery)[];
    }

    interface FetchOptions extends SyncOptions {
        require?: boolean;
        columns?: string | string[];
        withRelated?: (string | WithRelatedQuery)[];
    }

    interface WithRelatedQuery {
        [index: string]: (query: Knex.QueryBuilder) => Knex.QueryBuilder;
    }

    type FetchAllOptions = FetchOptions

    interface SaveOptions extends SyncOptions {
        method?: string;
        defaults?: string;
        patch?: boolean;
        require?: boolean;
    }

    interface DestroyOptions extends SyncOptions {
        require?: boolean;
    }

    interface SerializeOptions {
        shallow?: boolean;
        omitPivot?: boolean;
    }

    interface SetOptions {
        unset?: boolean;
    }

    interface TimestampOptions {
        method?: string;
    }

    interface SyncOptions {
        transacting?: Knex.Transaction;
        debug?: boolean;
    }

    interface CollectionOptions<T> {
        comparator?: boolean | string | ((a: T, b: T) => number);
    }

    interface CollectionAddOptions extends EventOptions {
        at?: number;
        merge?: boolean;
    }

    interface CollectionFetchOptions {
        require?: boolean;
        withRelated?: string | string[];
    }

    interface CollectionFetchOneOptions {
        require?: boolean;
        columns?: string | string[];
    }

    interface CollectionSetOptions extends EventOptions {
        add?: boolean;
        remove?: boolean;
        merge?: boolean;
    }

    interface PivotOptions {
        query?: (() => void) | any;
        require?: boolean;
    }

    interface EventOptions {
        silent?: boolean;
    }

    type EventFunction<T> = (model: T, attrs: any, options: any) => BlueBird<any> | void;

    interface CollectionCreateOptions extends ModelOptions, SyncOptions, CollectionAddOptions, SaveOptions {
    }
}

export = Bookshelf;
