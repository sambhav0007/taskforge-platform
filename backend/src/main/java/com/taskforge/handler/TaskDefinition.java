package com.taskforge.handler;

import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
public @interface TaskDefinition {
    String value();
    String description() default "";
}
