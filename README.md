# Visually

## Dependency Cruiser Column Header Semantics

### Stability Metrics

How can we measure the stability of a package? One way is to count the number of dependencies that enter and leave that package. These counts will allow us to calculate the positional stability of the package.

- `Ca`: Afferent couplings. The number of classes outside this package that depend on classes within this package.
- `Ce`: Efferent couplings. The number of classes inside this package that depend on classes outside this package.
- `I`: Instability.

```math
I = \frac{Ce}{Ca + Ce}, 0 \leq I \leq 1
```

- `I` -> 0 => Indicates a maximally stable package.
- `I` -> 1 => Indicates a maximally instable package.

### Measuring Abstraction

The A metric is a measure of the abstractness of a package. Its value is simply the ratio of abstract classes in a package to the total number of classes in a package.

- `Nc`: The number of classes in the package.
- `Na`: The number of abstract classes in the package. Remember, an abstract class is a class with at least one pure interface, and it cannot be instantiated.
- `A`: Abstractness.

```math
A = \frac{Na}{Nc}, 0 \leq A \leq 1
```

- `A` -> 0 => Implies that the package has not abstract classes at all.
- `A` -> 1 => Implies that the package contains nothing but abstract classes.
