declare global {
  /**
   * @see https://devblogs.microsoft.com/typescript/announcing-typescript-6-0-beta/#new-types-for-"upsert"-methods-(a.k.a.-getorinsert)
   * TODO: Delete once in baseline
   */
  interface Map<K, V> {
    /**
     * Returns a specified element from the Map object.
     * If no element is associated with the specified key, a new element with the value `defaultValue` will be inserted into the Map and returned.
     * @returns The element associated with the specified key, which will be `defaultValue` if no element previously existed.
     */
    getOrInsert(key: K, defaultValue: V): V;

    /**
     * Returns a specified element from the Map object.
     * If no element is associated with the specified key, the result of passing the specified key to the `callback` function will be inserted into the Map and returned.
     * @returns The element associated with the specific key, which will be the newly computed value if no element previously existed.
     */
    getOrInsertComputed(key: K, callback: (key: K) => V): V;
  }
}

// TODO: Delete once in baseline
if (typeof Map.prototype.getOrInsert !== 'function') {
  Map.prototype.getOrInsert = function <K, V>(key: K, defaultValue: V): V {
    if (!this.has(key)) {
      this.set(key, defaultValue);
    }
    return this.get(key);
  };
}

// TODO: Delete once in baseline
if (typeof Map.prototype.getOrInsertComputed !== 'function') {
  Map.prototype.getOrInsertComputed = function <K, V>(
    key: K,
    callback: (key: K) => V,
  ): V {
    if (!this.has(key)) {
      this.set(key, callback(key));
    }
    return this.get(key);
  };
}
