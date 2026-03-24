<?php

namespace App\Support\Filters;

use Illuminate\Database\Eloquent\Builder;

abstract class QueryFilter
{
    public function apply(Builder $query, array $filters): Builder
    {
        foreach ($this->filters() as $name) {
            $value = $filters[$name] ?? null;

            if ($value === null || $value === '' || ! method_exists($this, $name)) {
                continue;
            }

            $this->{$name}($query, $value);
        }

        return $query;
    }

    protected function like(Builder $query, string $column, string $value): void
    {
        $query->where($column, 'like', '%'.$value.'%');
    }

    protected function toBoolean(mixed $value): ?bool
    {
        if (is_bool($value)) {
            return $value;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    }

    abstract protected function filters(): array;
}
