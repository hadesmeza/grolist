namespace GROLIAAS.Repository
{
    public interface IRepository<TReturn>
    {
        TReturn Get(string sessionid);
        string Set(string sessionid);
    }
}