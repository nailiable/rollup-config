import "@nailyjs/metadata";

export function HelloWorld() {
  return "Hello World";
}

export default "hello world" as const;

export function Injectable() {
  return (target: unknown, ctx: ClassDecoratorContext) => {
    console.dir(ctx, { depth: null });
  };
}

export function Inject() {
  return (_target: undefined, ctx: ClassFieldDecoratorContext) => {
    console.dir(ctx, { depth: null });
  };
}

export function GetMapping() {
  return (_target: unknown, ctx: ClassMethodDecoratorContext) => {
    console.dir(ctx, { depth: null });
  };
}

class TestService {}

@Injectable()
export class TestInjectable {
  constructor(private readonly test: TestService) {}

  @Inject()
  readonly testInject: string;

  @GetMapping()
  getMapping(_ctx: TestService): string {
    return "hello";
  }
}

export * from "./hello/world";
